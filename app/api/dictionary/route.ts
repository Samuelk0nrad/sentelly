import { GoogleGenAI, Type } from "@google/genai";
import {
  getWordFromDatabase,
  saveWordToDatabase,
  WordDocument,
} from "@/lib/server/appwrite";
import {
  PerformanceTracker,
  extractTokenUsage,
} from "@/lib/utils/activity-tracker";
import { trackActivityServer } from "@/lib/server/activity-tracker";

const SYSTEM_PROMPT = `You are a dictionary API that provides detailed word definitions.
CRITICAL: You must ONLY return a valid JSON object with no additional text, markdown, or formatting.
The response must be a single JSON object in this exact format:
{
  "starting": "the appropriate determiner that should start the definition sentence",
  "word": "the word being defined",
  "phonetic": "phonetic pronunciation",
  "definition": "a single sentence definition that flows naturally after the starting word and the word itself",
  "examples": ["example sentences", "using the word"],
  "synonyms": ["list", "of", "synonyms"],
  "usage": "description of how the word is typically used"
}
Do not include any explanations, notes, or additional text before or after the JSON.

The "starting" field should contain the appropriate article or determiner (like "A", "An", "The") that makes the sentence flow naturally when combined as: "[starting] [word] [definition]"

For example, for the word "developer":
{
  "starting": "A",
  "word": "developer",
  "phonetic": "/dɪˈvel.ə.pər/",
  "definition": "is a person or company that creates software or websites.",
  "examples": [
    "She works as a web developer for a tech startup.",
    "The game developer released a new version of the app."
  ],
  "synonyms": ["programmer", "coder", "software engineer"],
  "usage": "The term 'developer' is commonly used in the technology industry to refer to individuals or teams responsible for building and maintaining software applications and websites."
}
`;

const SPELLING_CORRECTION_PROMPT = `You are a spelling correction assistant. Analyze the given word and determine if it's misspelled.
CRITICAL: You must ONLY return a valid JSON object with no additional text, markdown, or formatting.
The response must be a single JSON object in this exact format:
{
  "is_misspelling": boolean,
  "suggested_word": "the most likely correct spelling (empty string if no correction needed)",
  "alternative_suggestions": ["array", "of", "other", "possible", "corrections"]
}

Rules:
- If the word is correctly spelled, return is_misspelling: false and empty suggested_word
- If the word is misspelled, return is_misspelling: true with the most likely correction as suggested_word
- Provide up to 3-5 alternative suggestions in alternative_suggestions array
- Only suggest real English words
- Consider common typos, missing letters, extra letters, and letter swaps
- If you're unsure, err on the side of assuming the word is correct

Examples:
For "recieve": {"is_misspelling": true, "suggested_word": "receive", "alternative_suggestions": ["receive"]}
For "hello": {"is_misspelling": false, "suggested_word": "", "alternative_suggestions": []}
For "teh": {"is_misspelling": true, "suggested_word": "the", "alternative_suggestions": ["tea", "ten"]}
`;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

async function getSpellingSuggestions(word: string): Promise<{
  isMisspelling: boolean;
  suggestedWord: string;
  alternativeSuggestions: string[];
}> {
  try {
    const prompt = `${SPELLING_CORRECTION_PROMPT}\n\nAnalyze this word: ${word}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_misspelling: {
              type: Type.BOOLEAN,
            },
            suggested_word: {
              type: Type.STRING,
            },
            alternative_suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          propertyOrdering: [
            "is_misspelling",
            "suggested_word",
            "alternative_suggestions",
          ],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");

    return {
      isMisspelling: data.is_misspelling || false,
      suggestedWord: data.suggested_word || "",
      alternativeSuggestions: data.alternative_suggestions || [],
    };
  } catch (error) {
    console.error("Spelling correction error:", error);
    return {
      isMisspelling: false,
      suggestedWord: "",
      alternativeSuggestions: [],
    };
  }
}

async function getDefinitionFromGemini(
  word: string,
): Promise<{ wordDocument: WordDocument; tokensUsed: number }> {
  try {
    const prompt = `${SYSTEM_PROMPT}\n\nDefine the word: ${word}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            starting: {
              type: Type.STRING,
            },
            word: {
              type: Type.STRING,
            },
            phonetic: {
              type: Type.STRING,
            },
            definition: {
              type: Type.STRING,
            },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            synonyms: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            usage: {
              type: Type.STRING,
            },
          },
          propertyOrdering: [
            "starting",
            "word",
            "phonetic",
            "definition",
            "examples",
            "synonyms",
            "usage",
          ],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    const tokensUsed = extractTokenUsage(response);

    // Convert to WordDocument format
    const wordDocument: WordDocument = {
      word: data.word || word,
      starting: data.starting,
      phonetic: data.phonetic,
      definition: data.definition,
      examples: data.examples || [],
      synonyms: data.synonyms || [],
      usage: data.usage,
    };

    return { wordDocument, tokensUsed };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  const performanceTracker = new PerformanceTracker();
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");
  const ignoreCorrection = searchParams.get("ignoreCorrection") === "true";

  // Extract user info from headers or query params
  const userId = searchParams.get("user_id") || undefined;
  const userEmail = searchParams.get("user_email") || undefined;

  if (!word) {
    const responseTime = performanceTracker.end();

    // Track failed activity
    await trackActivityServer(
      {
        user_id: userId,
        user_email: userEmail,
        activity_type: "word_search",
        response_source: "error",
        response_time: responseTime,
        success: false,
        error_message: "Word parameter is required",
      },
      request,
    );

    return Response.json(
      { error: "Word parameter is required" },
      { status: 400 },
    );
  }

  try {
    let originalWord = word;
    let wordToSearch = word;
    let spellingCorrection = null;

    // Check for spelling corrections if not ignored
    if (!ignoreCorrection) {
      spellingCorrection = await getSpellingSuggestions(word);

      if (
        spellingCorrection.isMisspelling &&
        spellingCorrection.suggestedWord
      ) {
        wordToSearch = spellingCorrection.suggestedWord;
      }
    }

    // First, check if word exists in database
    const existingWord = await getWordFromDatabase(wordToSearch);

    if (existingWord) {
      const responseTime = performanceTracker.end();

      // Prepare response with spelling correction info
      const response = {
        ...existingWord,
        source: "database",
        ...(spellingCorrection?.isMisspelling && {
          originalWord,
          suggestedWord: spellingCorrection.suggestedWord,
          alternativeSuggestions: spellingCorrection.alternativeSuggestions,
          isCorrectionSuggested: true,
        }),
      };

      // Track successful database hit
      await trackActivityServer(
        {
          user_id: userId,
          user_email: userEmail,
          activity_type: "word_search",
          word_searched: wordToSearch,
          response_source: "database",
          response_time: responseTime,
          success: true,
          metadata: {
            cache_hit: true,
            word_id: existingWord.$id,
            ...(spellingCorrection?.isMisspelling && {
              original_word: originalWord,
              suggested_word: spellingCorrection.suggestedWord,
              correction_source: "gemini",
            }),
          },
        },
        request,
      );

      return Response.json(response);
    }

    // If not in database, get from Gemini and save
    const { wordDocument: definition, tokensUsed } =
      await getDefinitionFromGemini(wordToSearch);

    // Save to database
    const savedWord = await saveWordToDatabase(definition);
    const responseTime = performanceTracker.end();

    // Prepare response with spelling correction info
    const response = {
      ...(savedWord || definition),
      source: "gemini",
      ...(spellingCorrection?.isMisspelling && {
        originalWord,
        suggestedWord: spellingCorrection.suggestedWord,
        alternativeSuggestions: spellingCorrection.alternativeSuggestions,
        isCorrectionSuggested: true,
      }),
    };

    // Track successful Gemini API call
    await trackActivityServer(
      {
        user_id: userId,
        user_email: userEmail,
        activity_type: "word_search",
        word_searched: wordToSearch,
        response_source: "gemini",
        tokens_used: tokensUsed,
        response_time: responseTime,
        success: true,
        metadata: {
          gemini_model: "gemini-2.0-flash-lite",
          cache_hit: false,
          saved_to_database: !!savedWord,
          word_id: savedWord?.$id,
          ...(spellingCorrection?.isMisspelling && {
            original_word: originalWord,
            suggested_word: spellingCorrection.suggestedWord,
            correction_source: "gemini",
          }),
        },
      },
      request,
    );

    return Response.json(response);
  } catch (error) {
    console.error("API error:", error);
    const responseTime = performanceTracker.end();

    // Track failed activity
    await trackActivityServer(
      {
        user_id: userId,
        user_email: userEmail,
        activity_type: "word_search",
        word_searched: word,
        response_source: "error",
        response_time: responseTime,
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          error_type:
            error instanceof Error ? error.constructor.name : "UnknownError",
        },
      },
      request,
    );

    return Response.json(
      { error: "Failed to get definition" },
      { status: 500 },
    );
  }
}

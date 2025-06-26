import { GoogleGenAI, Type } from "@google/genai";
import {
  getWordFromDatabase,
  saveWordToDatabase,
  WordDocument,
} from "@/lib/server/appwrite";
import { trackActivity, PerformanceTracker, extractTokenUsage } from "@/lib/utils/activity-tracker";

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

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

async function getDefinitionFromGemini(word: string): Promise<{ wordDocument: WordDocument; tokensUsed: number }> {
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

  // Extract user info from headers or query params (you might want to use JWT tokens)
  const userId = searchParams.get("user_id") || null;
  const userEmail = searchParams.get("user_email") || null;

  if (!word) {
    const responseTime = performanceTracker.end();
    
    // Track failed activity
    await trackActivity({
      user_id: userId,
      user_email: userEmail,
      activity_type: "word_search",
      response_source: "error",
      response_time_ms: responseTime,
      success: false,
      error_message: "Word parameter is required",
    });

    return Response.json(
      { error: "Word parameter is required" },
      { status: 400 },
    );
  }

  try {
    // First, check if word exists in database
    const existingWord = await getWordFromDatabase(word);

    if (existingWord) {
      const responseTime = performanceTracker.end();
      
      // Track successful database hit
      await trackActivity({
        user_id: userId,
        user_email: userEmail,
        activity_type: "word_search",
        word_searched: word,
        response_source: "database",
        response_time_ms: responseTime,
        success: true,
        metadata: {
          cache_hit: true,
          word_id: existingWord.$id,
        },
      });

      return Response.json({
        ...existingWord,
        source: "database",
      });
    }

    // If not in database, get from Gemini and save
    const { wordDocument: definition, tokensUsed } = await getDefinitionFromGemini(word);

    // Save to database
    const savedWord = await saveWordToDatabase(definition);
    const responseTime = performanceTracker.end();

    // Track successful Gemini API call
    await trackActivity({
      user_id: userId,
      user_email: userEmail,
      activity_type: "word_search",
      word_searched: word,
      response_source: "gemini",
      tokens_used: tokensUsed,
      response_time_ms: responseTime,
      success: true,
      metadata: {
        gemini_model: "gemini-2.0-flash-lite",
        cache_hit: false,
        saved_to_database: !!savedWord,
        word_id: savedWord?.$id,
      },
    });

    if (savedWord) {
      return Response.json({
        ...savedWord,
        source: "gemini",
      });
    } else {
      return Response.json({
        ...definition,
        source: "gemini",
      });
    }
  } catch (error) {
    console.error("API error:", error);
    const responseTime = performanceTracker.end();
    
    // Track failed activity
    await trackActivity({
      user_id: userId,
      user_email: userEmail,
      activity_type: "word_search",
      word_searched: word,
      response_source: "error",
      response_time_ms: responseTime,
      success: false,
      error_message: error instanceof Error ? error.message : "Unknown error",
      metadata: {
        error_type: error instanceof Error ? error.constructor.name : "UnknownError",
      },
    });

    return Response.json(
      { error: "Failed to get definition" },
      { status: 500 },
    );
  }
}
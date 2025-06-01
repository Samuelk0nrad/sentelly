import { GoogleGenerativeAI } from "@google/generative-ai";
import { DictionaryResponse, GeminiPromptConfig } from "@/lib/types";

// Initialize the Gemini API with safety settings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const SYSTEM_PROMPT = `You are a dictionary API that provides detailed word definitions. 
Always respond with valid JSON that matches this structure exactly:
{
  "word": string,
  "phonetic": string (optional),
  "definition": string,
  "examples": string[] (optional),
  "synonyms": string[] (optional),
  "usage": string (optional)
}

The definition should be a single sentence that starts with the word and its phonetic (if available), followed by the definition.

Examples:

1. For the word "hello":
{
  "word": "hello",
  "phonetic": "/həˈloʊ/",
  "definition": "hello (/həˈloʊ/) is used as a greeting or to begin a conversation.",
  "examples": ["Hello, how are you?", "She said hello to everyone in the room."],
  "synonyms": ["hi", "greetings", "salutations"],
  "usage": "Used in both formal and informal situations as a greeting"
}

2. For the word "serendipity":
{
  "word": "serendipity",
  "phonetic": "/ˌsɛrənˈdɪpɪti/",
  "definition": "serendipity (/ˌsɛrənˈdɪpɪti/) refers to the occurrence and development of events by chance in a happy or beneficial way.",
  "examples": ["Finding his dream job while on vacation was pure serendipity.", "The discovery of penicillin was a moment of serendipity."],
  "synonyms": ["chance", "fate", "providence", "luck"],
  "usage": "Often used to describe fortunate coincidences or pleasant surprises"
}`;

async function getDefinitionFromGemini(word: string): Promise<DictionaryResponse> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.1, // Lower temperature for more consistent outputs
      topP: 0.1,
      topK: 16,
    },
  });

  const prompt = {
    word,
    instructions: "Provide a dictionary definition following the exact format shown in the examples. The definition MUST start with the word and its phonetic pronunciation.",
    format: "JSON only, no additional text or explanations"
  };

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: JSON.stringify(prompt, null, 2) }
    ]);

    const response = await result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text.trim()) as DictionaryResponse;
      
      // Validate the response structure
      if (!parsed.word || !parsed.definition) {
        throw new Error("Invalid response structure");
      }
      
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Failed to parse Gemini response as JSON");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return Response.json(
      { error: "Word parameter is required" },
      { status: 400 }
    );
  }

  try {
    const definition = await getDefinitionFromGemini(word);
    return Response.json(definition);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Failed to get definition" },
      { status: 500 }
    );
  }
}
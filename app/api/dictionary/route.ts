import { GoogleGenerativeAI } from "@google/generative-ai";
import { DictionaryResponse, GeminiPromptConfig } from "@/lib/types";

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

Important: The definition should be ONLY the meaning of the word, without including the word itself or its phonetic.

Examples:

1. For the word "hello":
{
  "word": "hello",
  "phonetic": "/həˈloʊ/",
  "definition": "a greeting used to begin a conversation",
  "examples": ["Hello, how are you?", "She said hello to everyone in the room."],
  "synonyms": ["hi", "greetings", "salutations"],
  "usage": "Used in both formal and informal situations as a greeting"
}

2. For the word "serendipity":
{
  "word": "serendipity",
  "phonetic": "/ˌsɛrənˈdɪpɪti/",
  "definition": "the occurrence and development of events by chance in a happy or beneficial way",
  "examples": ["Finding his dream job while on vacation was pure serendipity.", "The discovery of penicillin was a moment of serendipity."],
  "synonyms": ["chance", "fate", "providence", "luck"],
  "usage": "Often used to describe fortunate coincidences or pleasant surprises"
}`;

async function getDefinitionFromGemini(word: string): Promise<DictionaryResponse> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = {
    word,
    response_structure: {
      word: "string",
      phonetic: "string (optional)",
      definition: "string",
      examples: "array of strings (optional)",
      synonyms: "array of strings (optional)",
      usage: "string (optional)"
    }
  } as GeminiPromptConfig;

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: JSON.stringify(prompt) }
  ]);
  const response = result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text) as DictionaryResponse;
  } catch (error) {
    throw new Error("Failed to parse Gemini response as JSON");
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
    return Response.json(
      { error: "Failed to get definition" },
      { status: 500 }
    );
  }
}
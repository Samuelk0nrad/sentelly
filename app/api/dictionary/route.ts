import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { DictionaryResponse } from "@/lib/types";

// Initialize the Gemini API with safety settings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const SYSTEM_PROMPT = `You are a dictionary API that provides detailed word definitions.
CRITICAL: You must ONLY return a valid JSON object with no additional text, markdown, or formatting.
The response must be a single JSON object in this exact format:
{
  "word": "the word being defined",
  "phonetic": "phonetic pronunciation",
  "definition": "a single sentence definition that starts with the word and its phonetic",
  "examples": ["example sentences", "using the word"],
  "synonyms": ["list", "of", "synonyms"],
  "usage": "description of how the word is typically used"
}
Do not include any explanations, notes, or additional text before or after the JSON.`;

async function getDefinitionFromGemini(
  word: string,
): Promise<DictionaryResponse> {


  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents:
      `${SYSTEM_PROMPT}\n\nDefine the word: ${word}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipeName: {
              type: Type.STRING,
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
          propertyOrdering: ["recipeName", "ingredients"],
        },
      },
    },
  });

  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.1,
      topP: 0.1,
      topK: 16,
    }
  });

  try {
    const prompt = `${SYSTEM_PROMPT}\n\nDefine the word: ${word}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log("gemini res:", text);

    try {
      const parsed = JSON.parse(text) as DictionaryResponse;

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
      { status: 400 },
    );
  }

  try {
    const definition = await getDefinitionFromGemini(word);
    return Response.json(definition);
  } catch (error) {
    console.error("API error:", error);
    return Response.json(
      { error: "Failed to get definition" },
      { status: 500 },
    );
  }
}

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Type } from "@google/generative-ai";
import { DictionaryResponse } from "@/lib/types";

// Initialize the Gemini API with safety settings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const SYSTEM_PROMPT = `You are a dictionary API that provides detailed word definitions.`;

async function getDefinitionFromGemini(word: string): Promise<DictionaryResponse> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.1,
      topP: 0.1,
      topK: 16,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

  try {
    const result = await model.generateContent({
      contents: [{ text: `Define the word: ${word}` }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.1,
        topK: 16,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: {
            type: Type.STRING,
            description: "The word being defined"
          },
          phonetic: {
            type: Type.STRING,
            description: "The phonetic pronunciation of the word"
          },
          definition: {
            type: Type.STRING,
            description: "A single sentence definition that starts with the word and its phonetic"
          },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "Example sentences using the word"
          },
          synonyms: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "List of synonyms for the word"
          },
          usage: {
            type: Type.STRING,
            description: "Description of how the word is typically used"
          }
        },
        required: ["word", "definition"],
      }
    });

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
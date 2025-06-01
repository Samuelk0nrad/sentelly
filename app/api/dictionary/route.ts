import { GoogleGenAI, Type } from "@google/genai";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const SYSTEM_PROMPT = `You are a dictionary API that provides detailed word definitions.
CRITICAL: You must ONLY return a valid JSON object with no additional text, markdown, or formatting.
The response must be a single JSON object in this exact format:
{
  "word": "the word being defined",
  "phonetic": "phonetic pronunciation",
  "definition": "a single sentence definition formulated so it starts with the word and its phonetic but do not include the word itself and the phonetic",
  "examples": ["example sentences", "using the word"],
  "synonyms": ["list", "of", "synonyms"],
  "usage": "description of how the word is typically used"
}
Do not include any explanations, notes, or additional text before or after the JSON.

For example, for the word "developer":
{
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

async function getDefinitionFromGemini(word: string) {
  // Check cache first
  const cached = cache.get(word);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for word: ${word}`);
    return cached.data;
  }

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
    
    // Store in cache
    cache.set(word, { data, timestamp: Date.now() });
    console.log(`Cached definition for word: ${word}`);
    
    return data;
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
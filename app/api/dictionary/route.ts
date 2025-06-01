import { GoogleGenerativeAI } from "@google/generative-ai";

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
}`;

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

async function getDefinitionFromGemini(word: string) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `${SYSTEM_PROMPT}\n\nDefine the word: ${word}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return JSON.parse(text);
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
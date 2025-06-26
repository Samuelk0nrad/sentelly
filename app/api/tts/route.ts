import { NextResponse } from "next/server";
import { 
  getWordFromDatabase, 
  updateWordPronunciation, 
  saveAudioToStorage,
  downloadAudioFromStorage 
} from "@/lib/appwrite";

async function getAudioFromElevenLabs(text: string): Promise<ArrayBuffer> {
  const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID (Rachel)
  const API_KEY = process.env.ELEVENLABS_API_KEY;

  if (!API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`);
  }

  return await response.arrayBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");

  if (!text) {
    return NextResponse.json(
      { error: "Text parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Check if word exists in database and has pronunciation
    console.log(`Checking for existing pronunciation: ${text}`);
    const existingWord = await getWordFromDatabase(text);
    
    if (existingWord?.pronunciation_id) {
      console.log(`Found existing pronunciation in storage: ${existingWord.pronunciation_id}`);
      try {
        const audioBlob = await downloadAudioFromStorage(existingWord.pronunciation_id);
        if (audioBlob) {
          const audioBuffer = await audioBlob.arrayBuffer();
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch (storageError) {
        console.error("Error downloading from storage, falling back to ElevenLabs:", storageError);
      }
    }

    // Generate new audio from ElevenLabs
    console.log(`Generating new audio from ElevenLabs: ${text}`);
    const audioBuffer = await getAudioFromElevenLabs(text);
    
    // Save to storage if we have a word document
    if (existingWord) {
      try {
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const fileName = `${text.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.mp3`;
        
        console.log(`Saving audio to storage: ${fileName}`);
        const pronunciationId = await saveAudioToStorage(audioBlob, fileName);
        
        if (pronunciationId && existingWord.$id) {
          console.log(`Updating word with pronunciation ID: ${pronunciationId}`);
          await updateWordPronunciation(existingWord.$id, pronunciationId);
        }
      } catch (storageError) {
        console.error("Error saving to storage:", storageError);
        // Continue anyway, return the audio
      }
    }
    
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
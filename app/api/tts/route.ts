import { NextResponse } from "next/server";
import {
  getWordFromDatabase,
  updateWordPronunciation,
  saveAudioToStorage,
  getAudioData,
} from "@/lib/server/appwrite";

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
    },
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
      { status: 400 },
    );
  }

  try {
    // Check if word exists in database and has pronunciation
    const existingWord = await getWordFromDatabase(text);

    if (existingWord?.pronunciation_id) {
      try {
        const audioData = await getAudioData(existingWord.pronunciation_id);

        if (audioData) {
          return new NextResponse(audioData, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      } catch (error) {
        console.error("Error fetching audio data from storage:", {
          error: error,
          message: error instanceof Error ? error.message : "Unknown error",
          wordId: existingWord.$id,
        });
      }
    }

    // Generate new audio from ElevenLabs
    const audioBuffer = await getAudioFromElevenLabs(text);
    // Save to storage if we have a word document
    if (existingWord) {
      try {
        const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
        const fileName = `${text.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.mp3`;

        const pronunciationId = await saveAudioToStorage(audioBlob, fileName);

        if (pronunciationId) {
          if (existingWord.$id) {
            await updateWordPronunciation(existingWord.$id, pronunciationId);
          }
        } else {
          console.error(
            `❌ Failed to save audio to storage (pronunciationId is null)`,
          );
        }
      } catch (storageError) {
        console.error("❌ Error saving to storage:", {
          error: storageError,
          message:
            storageError instanceof Error
              ? storageError.message
              : "Unknown error",
          wordId: existingWord.$id,
        });
        // Continue anyway, return the audio
      }
    } else {
      console.warn(`⚠️ No existing word document found, skipping storage save`);
    }

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("❌ TTS API error:", {
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      text: text,
    });
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 },
    );
  }
}

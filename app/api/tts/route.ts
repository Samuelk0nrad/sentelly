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
    console.log(`🔍 Checking for existing pronunciation: "${text}"`);
    const existingWord = await getWordFromDatabase(text);

    if (existingWord) {
      console.log(`📝 Word found in database:`, {
        id: existingWord.$id,
        word: existingWord.word,
        pronunciation_id: existingWord.pronunciation_id,
        hasAudio: !!existingWord.pronunciation_id
      });
    } else {
      console.log(`❌ Word "${text}" not found in database`);
    }

    if (existingWord?.pronunciation_id) {
      console.log(
        `🎵 Found existing pronunciation in storage: ${existingWord.pronunciation_id}`,
      );
      try {
        console.log(`⬬ Attempting to download audio from Appwrite storage...`);
        const audioData = await getAudioData(existingWord.pronunciation_id);
        
        if (audioData) {
          console.log(`✅ Successfully retrieved audio from storage:`, {
            fileId: existingWord.pronunciation_id,
            dataType: audioData.constructor.name,
            sizeBytes: audioData.byteLength,
            sizeKB: Math.round(audioData.byteLength / 1024 * 100) / 100
          });
          
          return new NextResponse(audioData, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        } else {
          console.log(`❌ audioData is null/undefined, falling back to ElevenLabs`);
        }
      } catch (storageError) {
        console.error(
          `❌ Error downloading from storage, falling back to ElevenLabs:`,
          {
            error: storageError,
            message: storageError instanceof Error ? storageError.message : 'Unknown error',
            fileId: existingWord.pronunciation_id
          }
        );
      }
    }

    // Generate new audio from ElevenLabs
    console.log(`🎤 Generating new audio from ElevenLabs: "${text}"`);
    const audioBuffer = await getAudioFromElevenLabs(text);
    console.log(`✅ ElevenLabs audio generated:`, {
      sizeBytes: audioBuffer.byteLength,
      sizeKB: Math.round(audioBuffer.byteLength / 1024 * 100) / 100
    });

    // Save to storage if we have a word document
    if (existingWord) {
      console.log(`💾 Attempting to save audio to Appwrite storage for word: "${existingWord.word}"`);
      try {
        const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
        const fileName = `${text.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.mp3`;

        console.log(`📁 Saving audio to storage with filename: ${fileName}`);
        const pronunciationId = await saveAudioToStorage(audioBlob, fileName);

        if (pronunciationId) {
          console.log(`✅ Audio saved to storage with ID: ${pronunciationId}`);
          
          if (existingWord.$id) {
            console.log(`🔄 Updating word document with pronunciation ID...`);
            await updateWordPronunciation(existingWord.$id, pronunciationId);
            console.log(`✅ Word document updated successfully`);
          } else {
            console.log(`⚠️ existingWord.$id is missing, cannot update word document`);
          }
        } else {
          console.log(`❌ Failed to save audio to storage (pronunciationId is null)`);
        }
      } catch (storageError) {
        console.error("❌ Error saving to storage:", {
          error: storageError,
          message: storageError instanceof Error ? storageError.message : 'Unknown error',
          wordId: existingWord.$id
        });
        // Continue anyway, return the audio
      }
    } else {
      console.log(`⚠️ No existing word document found, skipping storage save`);
    }

    console.log(`🎵 Returning ElevenLabs audio response:`, {
      sizeBytes: audioBuffer.byteLength,
      sizeKB: Math.round(audioBuffer.byteLength / 1024 * 100) / 100,
      source: 'ElevenLabs'
    });

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("❌ TTS API error:", {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      text: text
    });
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 },
    );
  }
}

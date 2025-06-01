import { NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { audio: ArrayBuffer; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function getAudioFromElevenLabs(text: string) {
  const cached = cache.get(text);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache hit for text: ${text}`);
    return cached.audio;
  }

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

  const audioArrayBuffer = await response.arrayBuffer();
  
  // Store in cache
  cache.set(text, { audio: audioArrayBuffer, timestamp: Date.now() });
  console.log(`Cached audio for text: ${text}`);
  
  return audioArrayBuffer;
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
    const audioBuffer = await getAudioFromElevenLabs(text);
    
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
"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Volume2, Database, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  trackActivity,
  PerformanceTracker,
} from "@/lib/utils/activity-tracker";

interface DictionaryResponse {
  $id?: string;
  starting: string;
  word: string;
  phonetic: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  usage: string;
  pronunciation_id?: string;
  source?: "database" | "gemini";
  originalWord?: string;
  suggestedWord?: string;
  alternativeSuggestions?: string[];
  isCorrectionSuggested?: boolean;
}

interface DictionaryResultProps {
  result: DictionaryResponse | null;
  loading: boolean;
  error: string | null;
  currentUser?: any;
}

export default function DictionaryResult({
  result,
  loading,
  error,
  currentUser,
}: DictionaryResultProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (word: string) => {
    const performanceTracker = new PerformanceTracker();

    try {
      setIsPlaying(true);

      // Build URL with user info for server-side tracking
      const url = new URL(`/api/tts`, window.location.origin);
      url.searchParams.set("text", word);
      if (currentUser?.$id) {
        url.searchParams.set("user_id", currentUser.$id);
      }
      if (currentUser?.email) {
        url.searchParams.set("user_email", currentUser.email);
      }

      // Fetch audio from our API (which handles caching)
      const response = await fetch(url.toString());
      const responseTime = performanceTracker.end();

      if (!response.ok) throw new Error("Failed to fetch audio");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = audioUrl;
      await audioRef.current.play();

      // Calculate audio duration for tracking
      const audioDuration = audioRef.current.duration * 1000; // Convert to ms

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Clean up
      };

      // Track successful audio playback
      await trackActivity({
        user_id: currentUser?.$id,
        user_email: currentUser?.email,
        activity_type: "audio_generation",
        word_searched: word,
        response_source: "database", // Will be updated by server if it's actually from ElevenLabs
        response_time: responseTime,
        success: true,
        metadata: {
          client_side_tracking: true,
          audio_duration_ms: audioDuration || 0,
          audio_size_bytes: audioBlob.size,
        },
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      const responseTime = performanceTracker.end();

      setIsPlaying(false);

      // Track failed audio playback
      await trackActivity({
        user_id: currentUser?.$id,
        user_email: currentUser?.email,
        activity_type: "audio_generation",
        word_searched: word,
        response_source: "error",
        response_time: responseTime,
        success: false,
        error_message: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          client_side_tracking: true,
        },
      });
    }
  };

  if (loading) {
    return (
      <Card className="animate-fade-in w-full overflow-hidden rounded-xl border-0 bg-white/5 backdrop-blur-lg sm:rounded-2xl">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <Skeleton className="mb-2 h-4 w-1/3 bg-white/10 sm:h-6 md:h-8" />
          <Skeleton className="h-3 w-2/3 bg-white/10 sm:h-3 md:h-4" />
        </CardHeader>
        <CardContent className="space-y-2 p-3 sm:space-y-3 sm:p-4 md:space-y-4 md:p-6">
          <Skeleton className="h-3 w-full bg-white/10 sm:h-3 md:h-4" />
          <Skeleton className="h-3 w-full bg-white/10 sm:h-3 md:h-4" />
          <Skeleton className="h-3 w-3/4 bg-white/10 sm:h-3 md:h-4" />

          <div className="pt-2 sm:pt-3 md:pt-4">
            <Skeleton className="mb-2 h-3 w-1/4 bg-white/10 sm:h-4 md:h-5" />
            <Skeleton className="h-3 w-full bg-white/10 sm:h-3 md:h-4" />
            <Skeleton className="mt-1 h-3 w-5/6 bg-white/10 sm:h-3 md:h-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="animate-fade-in rounded-xl border-red-700/20 bg-red-950/20 backdrop-blur-lg sm:rounded-2xl"
      >
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertTitle className="text-sm text-red-400 sm:text-base">
          ERROR
        </AlertTitle>
        <AlertDescription className="font-mono text-xs text-red-300 sm:text-sm md:text-base">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Card className="animate-fade-in w-full overflow-hidden rounded-xl border border-white/50 bg-gray-300/20 backdrop-blur-2xl sm:rounded-2xl">
      <CardHeader className="relative p-3 backdrop-blur-sm sm:p-4 md:p-6">
        <div className="relative z-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3 md:gap-4">
            {/* Main definition text */}
            <div className="flex-1">
              <p className="text-sm leading-relaxed font-medium text-white/90 sm:text-base md:text-lg lg:text-xl">
                <span className="text-white/70">{result.starting}</span>{" "}
                <span className="text-lg font-extrabold text-white sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                  {result.word}
                </span>{" "}
                <span className="text-white/90">{result.definition}</span>
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
              {/* Phonetic and audio controls */}
              {result.phonetic && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-mono text-xs font-medium text-white/60 sm:text-sm md:text-base">
                    {result.phonetic}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0 rounded-full border border-white/25 bg-white/10 p-1 hover:bg-white/20 sm:h-7 sm:w-7 md:h-8 md:w-8"
                    onClick={() => playAudio(result.word)}
                    disabled={isPlaying}
                  >
                    <Volume2 className="h-3 w-3 text-white/80 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    <span className="sr-only">Play pronunciation</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:space-y-6 md:p-6">
        {/* Examples Section */}
        {result.examples && result.examples.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-bold text-white/95 sm:text-sm md:text-base">
              EXAMPLES:
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {result.examples.map((example, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/15 bg-white/3 p-2 font-mono text-xs break-words text-white/80 italic shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm sm:p-2.5 sm:text-sm md:p-3 md:text-base"
                >
                  <span className="text-white/60">$ </span>
                  {example}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Section */}
        {result.usage && (
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-bold text-white/95 sm:text-sm md:text-base">
              USAGE:
            </h3>
            <div className="rounded-lg border border-white/15 bg-white/3 p-2 font-mono text-xs break-words text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:p-2.5 sm:text-sm md:p-3 md:text-base">
              {result.usage}
            </div>
          </div>
        )}

        {/* Synonyms Section */}
        {result.synonyms && result.synonyms.length > 0 && (
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-bold text-white/95 sm:text-sm md:text-base">
              SYNONYMS:
            </h3>
            <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
              {result.synonyms.map((synonym, index) => (
                <span
                  key={index}
                  className="rounded-full border border-white/25 bg-gradient-to-r from-white/10 to-white/5 px-2 py-0.5 font-mono text-xs break-words text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md transition-all hover:border-white/35 hover:from-white/20 hover:to-white/10 hover:shadow-[0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] sm:px-3 sm:py-1 sm:text-sm md:px-4 md:py-1.5"
                >
                  {synonym}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

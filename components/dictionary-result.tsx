"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Volume2, Database, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

interface DictionaryResultProps {
  result: DictionaryResponse | null;
  loading: boolean;
  error: string | null;
}

export default function DictionaryResult({
  result,
  loading,
  error,
}: DictionaryResultProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (word: string) => {
    try {
      setIsPlaying(true);

      // Fetch audio from our API (which handles caching)
      const response = await fetch(`/api/tts?text=${encodeURIComponent(word)}`);
      if (!response.ok) throw new Error("Failed to fetch audio");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = audioUrl;
      await audioRef.current.play();

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Clean up
      };
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-fade-in w-full overflow-hidden rounded-2xl border-0 bg-white/5 backdrop-blur-lg">
        <CardHeader className="p-4 md:p-6">
          <Skeleton className="mb-2 h-6 w-1/3 bg-white/10 md:h-8" />
          <Skeleton className="h-3 w-2/3 bg-white/10 md:h-4" />
        </CardHeader>
        <CardContent className="space-y-3 p-4 md:space-y-4 md:p-6">
          <Skeleton className="h-3 w-full bg-white/10 md:h-4" />
          <Skeleton className="h-3 w-full bg-white/10 md:h-4" />
          <Skeleton className="h-3 w-3/4 bg-white/10 md:h-4" />

          <div className="pt-3 md:pt-4">
            <Skeleton className="mb-2 h-4 w-1/4 bg-white/10 md:h-5" />
            <Skeleton className="h-3 w-full bg-white/10 md:h-4" />
            <Skeleton className="mt-1 h-3 w-5/6 bg-white/10 md:h-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        variant="destructive"
        className="animate-fade-in rounded-2xl border-red-700/20 bg-red-950/20 backdrop-blur-lg"
      >
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertTitle className="text-red-400">ERROR</AlertTitle>
        <AlertDescription className="font-mono text-sm text-red-300 md:text-base">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Card className="animate-fade-in w-full overflow-hidden rounded-2xl border border-white/50 bg-gray-300/20 backdrop-blur-2xl">
      <CardHeader className="relative p-4 backdrop-blur-sm md:p-6">
        <div className="relative z-10">
          <p className="text-base leading-relaxed font-medium text-white/90 md:text-lg lg:text-xl">
            <span className="text-white/70">{result.starting}</span>{" "}
            <span className="inline-flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white md:text-3xl lg:text-4xl">
                {result.word}
              </span>
              {result.phonetic && (
                <>
                  <span className="text-sm font-medium text-white/60 md:text-base">
                    {result.phonetic}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full border border-white/25 bg-white/10 p-1 hover:bg-white/20 md:h-7 md:w-7"
                    onClick={() => playAudio(result.word)}
                    disabled={isPlaying}
                  >
                    <Volume2 className="h-3 w-3 text-white/80 md:h-3.5 md:w-3.5" />
                    <span className="sr-only">Play pronunciation</span>
                  </Button>
                </>
              )}
            </span>{" "}
            <span className="text-white/90">{result.definition}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:space-y-6 md:p-6">
        {result.examples && result.examples.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <h3 className="md:text-md text-sm font-bold text-white/95">
              EXAMPLES:
            </h3>
            <ul className="space-y-2">
              {result.examples.map((example, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-white/15 bg-white/3 p-2.5 font-mono text-sm text-white/80 italic shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm md:p-3 md:text-base"
                >
                  $ {example}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.usage && (
          <div className="space-y-2">
            <h3 className="md:text-md text-sm font-bold text-white/95">
              USAGE:
            </h3>
            <p className="rounded-lg border border-white/15 bg-white/3 p-2.5 font-mono text-sm text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] md:p-3 md:text-base">
              {result.usage}
            </p>
          </div>
        )}
        {result.synonyms && result.synonyms.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <h3 className="md:text-md text-sm font-bold text-white/95">
              SYNONYMS:
            </h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {result.synonyms.map((synonym, index) => (
                <span
                  key={index}
                  className="rounded-full border border-white/25 bg-gradient-to-r from-white/10 to-white/5 px-3 py-1 font-mono text-xs text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md transition-all hover:border-white/35 hover:from-white/20 hover:to-white/10 hover:shadow-[0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] md:px-4 md:py-1.5 md:text-sm"
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

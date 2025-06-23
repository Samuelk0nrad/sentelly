"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Volume2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DictionaryResponse {
  word: string;
  phonetic: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  usage: string;
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
  const audioCache = useRef<Map<string, string>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = async (word: string) => {
    try {
      setIsPlaying(true);

      // Check if we have the audio URL cached
      let audioUrl = audioCache.current.get(word);

      if (!audioUrl) {
        // Fetch new audio if not cached
        const response = await fetch(`/api/tts?text=${encodeURIComponent(word)}`);
        if (!response.ok) throw new Error("Failed to fetch audio");

        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        audioCache.current.set(word, audioUrl);
      }

      // Create and play audio
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      audioRef.current.src = audioUrl;
      await audioRef.current.play();
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
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
          <Skeleton className="mb-2 h-6 md:h-8 w-1/3 bg-white/10" />
          <Skeleton className="h-3 md:h-4 w-2/3 bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
          <Skeleton className="h-3 md:h-4 w-full bg-white/10" />
          <Skeleton className="h-3 md:h-4 w-full bg-white/10" />
          <Skeleton className="h-3 md:h-4 w-3/4 bg-white/10" />

          <div className="pt-3 md:pt-4">
            <Skeleton className="mb-2 h-4 md:h-5 w-1/4 bg-white/10" />
            <Skeleton className="h-3 md:h-4 w-full bg-white/10" />
            <Skeleton className="mt-1 h-3 md:h-4 w-5/6 bg-white/10" />
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
        <AlertDescription className="font-mono text-sm md:text-base text-red-300">
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
      <CardHeader className="relative backdrop-blur-sm p-4 md:p-6">
        <div className="relative z-10">
          <p className="text-sm md:text-md font-mono text-base md:text-lg font-bold text-white/90 lg:text-xl">
            <strong className="text-xl md:text-2xl lg:text-4xl font-extrabold text-white block md:inline">
              {result.word}
            </strong>
            {result.phonetic && (
              <span className="text-sm md:text-md ml-0 md:ml-2 font-medium text-white/60 block md:inline mt-1 md:mt-0">
                ({result.phonetic})
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1 h-5 w-5 md:h-6 md:w-6 rounded-full border border-white/25 bg-white/10 p-1 hover:bg-white/20"
                  onClick={() => playAudio(result.word)}
                  disabled={isPlaying}
                >
                  <Volume2 className="h-2.5 w-2.5 md:h-3 md:w-3 text-white/80" />
                  <span className="sr-only">Play pronunciation</span>
                </Button>
              </span>
            )}
            <span className="block mt-2 md:mt-0 md:inline text-sm md:text-base lg:text-lg font-normal">
              {result.definition}
            </span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        {result.examples && result.examples.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-md font-bold text-white/95">EXAMPLES:</h3>
            <ul className="space-y-2">
              {result.examples.map((example, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-white/15 bg-white/3 p-2.5 md:p-3 font-mono text-sm md:text-base text-white/80 italic shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm"
                >
                  $ {example}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.usage && (
          <div className="space-y-2">
            <h3 className="text-sm md:text-md font-bold text-white/95">USAGE:</h3>
            <p className="rounded-lg border border-white/15 bg-white/3 p-2.5 md:p-3 font-mono text-sm md:text-base text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {result.usage}
            </p>
          </div>
        )}
        {result.synonyms && result.synonyms.length > 0 && (
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-md font-bold text-white/95">SYNONYMS:</h3>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {result.synonyms.map((synonym, index) => (
                <span
                  key={index}
                  className="rounded-full border border-white/25 bg-gradient-to-r from-white/10 to-white/5 px-3 md:px-4 py-1 md:py-1.5 font-mono text-xs md:text-sm text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md transition-all hover:border-white/35 hover:from-white/20 hover:to-white/10 hover:shadow-[0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]"
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
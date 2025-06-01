"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  if (loading) {
    return (
      <Card className="animate-fade-in w-full overflow-hidden rounded-2xl border-0 bg-white/5 backdrop-blur-lg">
        <CardHeader>
          <Skeleton className="mb-2 h-8 w-1/3 bg-white/10" />
          <Skeleton className="h-4 w-2/3 bg-white/10" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-3/4 bg-white/10" />

          <div className="pt-4">
            <Skeleton className="mb-2 h-5 w-1/4 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="mt-1 h-4 w-5/6 bg-white/10" />
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
        <AlertDescription className="font-mono text-red-300">
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
      <CardHeader className="relative backdrop-blur-sm">
        <div className="relative z-10">
          <p className="text-md font-mono text-lg font-bold text-white/90 md:text-xl">
            <strong className="text-2xl font-extrabold text-white md:text-4xl">
              {result.word}
            </strong>
            {result.phonetic && (
              <span className="text-md ml-2 font-medium text-white/60">
                ({result.phonetic})
              </span>
            )}{" "}
            {result.definition}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {" "}
        {result.examples && result.examples.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-bold text-white/95">EXAMPLES:</h3>
            <ul className="space-y-2">
              {result.examples.map((example, index) => (
                <li
                  key={index}
                  className="rounded-lg border border-white/15 bg-white/3 p-3 font-mono text-white/80 italic shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm"
                >
                  $ {example}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.usage && (
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white/95">USAGE:</h3>
            <p className="rounded-lg border border-white/15 bg-white/3 p-3 font-mono text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              {result.usage}
            </p>
          </div>
        )}
        {result.synonyms && result.synonyms.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-bold text-white/95">SYNONYMS:</h3>
            <div className="flex flex-wrap gap-2">
              {result.synonyms.map((synonym, index) => (
                <span
                  key={index}
                  className="rounded-full border border-white/25 bg-gradient-to-r from-white/10 to-white/5 px-4 py-1.5 font-mono text-sm text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-md transition-all hover:border-white/35 hover:from-white/20 hover:to-white/10 hover:shadow-[0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]"
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

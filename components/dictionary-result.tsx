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
    <Card className="animate-fade-in w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-white/10 to-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-lg">
      <CardHeader className="relative border-b border-white/10 bg-white/5 pb-6">
        <div className="relative z-10">
          <p className="font-mono text-lg text-white/90">
            <strong className="text-xl font-bold text-white md:text-2xl">
              {result.word}
            </strong>
            {result.phonetic && (
              <span className="ml-2 text-sm text-white/70">
                ({result.phonetic})
              </span>
            )}{" "}
            {result.definition}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {result.examples && result.examples.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-bold text-white/90">EXAMPLES:</h3>
            <ul className="space-y-2">
              {result.examples.map((example, index) => (
                <li
                  key={index}
                  className="font-mono text-white/70 italic backdrop-blur-sm"
                >
                  $ {example}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.usage && (
          <div className="space-y-2">
            <h3 className="text-md font-bold text-white/90">USAGE:</h3>
            <p className="font-mono text-white/70">{result.usage}</p>
          </div>
        )}

        {result.synonyms && result.synonyms.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-md font-bold text-white/90">SYNONYMS:</h3>
            <div className="flex flex-wrap gap-2">
              {result.synonyms.map((synonym, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gradient-to-r from-purple-500/30 to-purple-600/30 px-4 py-1.5 font-mono text-sm text-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all hover:from-purple-500/40 hover:to-purple-600/40 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"
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
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
      <Card className="animate-fade-in w-full rounded-2xl border-gray-700 bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="mb-2 h-8 w-1/3 bg-gray-600" />
          <Skeleton className="h-4 w-2/3 bg-gray-600" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-gray-600" />
          <Skeleton className="h-4 w-full bg-gray-600" />
          <Skeleton className="h-4 w-3/4 bg-gray-600" />

          <div className="pt-4">
            <Skeleton className="mb-2 h-5 w-1/4 bg-gray-600" />
            <Skeleton className="h-4 w-full bg-gray-600" />
            <Skeleton className="mt-1 h-4 w-5/6 bg-gray-600" />
          </div>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Alert
        variant="destructive"
        className="animate-fade-in rounded-2xl border-red-700/50 bg-red-900/20"
      >
        <AlertCircle className="h-4 w-4 text-white" />
        <AlertTitle className="text-white">ERROR</AlertTitle>
        <AlertDescription className="font-mono text-red-200">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return null;
  }
  return (
    <Card className="animate-fade-in w-full rounded-2xl border-0 bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <p className="font-mono text-lg text-white">
          <strong className="text-xl font-bold text-white md:text-2xl">
            {result.word}
          </strong>
          {result.phonetic && (
            <span className="ml-2 text-sm text-gray-300">
              ({result.phonetic})
            </span>
          )}{" "}
          {result.definition}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {result.examples && result.examples.length > 0 && (
          <div>
            <h3 className="text-md font-bold text-white">EXAMPLES:</h3>
            <ul className="space-y-2">
              {result.examples.map((example, index) => (
                <li key={index} className="font-mono text-gray-300 italic">
                  $ {example}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.usage && (
          <div>
            <h3 className="text-md font-bold text-white">USAGE:</h3>
            <p className="font-mono text-gray-300">{result.usage}</p>
          </div>
        )}

        {result.synonyms && result.synonyms.length > 0 && (
          <div>
            <h3 className="text-md font-bold text-white">SYNONYMS:</h3>
            <div className="flex flex-wrap gap-2">
              {result.synonyms.map((synonym, index) => (
                <span
                  key={index}
                  className="rounded-full border border-purple-500/50 bg-purple-600/80 px-3 py-1 font-mono text-sm text-white transition-colors hover:bg-purple-500/80"
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
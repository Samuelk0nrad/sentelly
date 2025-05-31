"use client";

import { DictionaryResponse } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DictionaryResultProps {
  result: DictionaryResponse | null;
  loading: boolean;
  error: string | null;
}

export default function DictionaryResult({ result, loading, error }: DictionaryResultProps) {
  if (loading) {
    return (
      <Card className="w-full animate-fade-in bg-black/20 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <Skeleton className="h-8 w-1/3 mb-2 bg-slate-700" />
          <Skeleton className="h-4 w-2/3 bg-slate-700" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-3/4 bg-slate-700" />
          
          <div className="pt-4">
            <Skeleton className="h-5 w-1/4 mb-2 bg-slate-700" />
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-5/6 mt-1 bg-slate-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="animate-fade-in border-red-900/50 bg-red-900/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>ERROR</AlertTitle>
        <AlertDescription className="font-mono">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <Card className="w-full animate-fade-in border-0 bg-transparent transition-colors">
      <CardHeader>
        <p className="text-lg font-mono">
          <strong className="text-xl md:text-2xl font-bold">{result.word}</strong>
          {result.phonetic && (
            <span className="text-slate-400 text-sm ml-2">({result.phonetic})</span>
          )}{' '}
          {result.definition}
        </p>

      </CardHeader>
      <CardContent className="space-y-6">

        {result.examples && result.examples.length > 0 && (
          <div>
            <h3 className="text-md font-bold">EXAMPLES:</h3>
            <ul className="space-y-2">
              {result.examples.map((example, index) => (
                <li key={index} className="italic text-slate-400 font-mono">$ {example}</li>
              ))}
            </ul>
          </div>
        )}

        {result.usage && (
          <div>
            <h3 className="text-md font-bold">USAGE:</h3>
            <p className="text-slate-400 font-mono">{result.usage}</p>
          </div>
        )}

        {result.synonyms && result.synonyms.length > 0 && (
          <div>
            <h3 className="text-md font-bold">SYNONYMS:</h3>
            <div className="flex flex-wrap gap-2">
              {result.synonyms.map((synonym, index) => (
                <span 
                  key={index} 
                  className="bg-accent/20 text-accent px-3 py-1 font-mono border border-accent/50"
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
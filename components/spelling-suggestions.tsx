"use client";

import { Badge } from "@/components/ui/badge";

interface SpellingSuggestionsProps {
  originalWord: string;
  suggestedWord: string;
  alternativeSuggestions: string[];
  onWordSelect: (word: string, isOriginal?: boolean) => void;
}

export default function SpellingSuggestions({
  originalWord,
  suggestedWord,
  alternativeSuggestions,
  onWordSelect,
}: SpellingSuggestionsProps) {
  // Create a unique list of all suggestions including the original word
  const allSuggestions = [
    { word: originalWord, isOriginal: true, label: `${originalWord} (original)` },
    { word: suggestedWord, isOriginal: false, label: `${suggestedWord} (suggested)` },
    ...alternativeSuggestions
      .filter(word => word !== originalWord && word !== suggestedWord)
      .map(word => ({ word, isOriginal: false, label: word }))
  ];

  return (
    <div className="mb-4 animate-fade-in">
      <div className="rounded-xl border border-white/30 bg-white/5 backdrop-blur-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3">
          Did you mean one of these words?
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {allSuggestions.map(({ word, isOriginal, label }, index) => (
            <Badge
              key={`${word}-${index}`}
              variant="outline"
              className={`cursor-pointer transition-all duration-200 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-white/25 backdrop-blur-md hover:border-white/40 hover:shadow-[0_4px_16px_rgba(255,255,255,0.15)] ${
                isOriginal
                  ? "bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                  : index === 1 // suggestedWord (most likely)
                  ? "bg-green-500/20 text-green-200 hover:bg-green-500/30 ring-1 ring-green-400/30"
                  : "bg-white/10 text-white/90 hover:bg-white/20"
              }`}
              onClick={() => onWordSelect(word, isOriginal)}
            >
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
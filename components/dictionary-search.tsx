"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import DictionaryResult from "@/components/dictionary-result";

interface DictionaryResponse {
  word: string;
  phonetic: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  usage: string;
}

export default function DictionarySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<DictionaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dictionary?word=${encodeURIComponent(searchTerm)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch definition");
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setResult(null);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div
      className={`w-full transition-all duration-700 ease-in-out ${hasSearched ? "flex items-center gap-8" : "block"}`}
    >
      <form
        onSubmit={handleSearch}
        className={`transition-all duration-700 ${hasSearched ? "w-1/2" : "mx-auto w-full max-w-2xl"}`}
      >
        <div className="group relative">
          <Input
            type="text"
            placeholder="ENTER QUERY..."
            className="h-14 rounded-2xl border border-white/50 bg-gray-300/20 pr-14 pl-4 text-lg text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-all placeholder:text-white/50 hover:border-white/60 focus:border-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-2 right-2 h-10 w-10 rounded-xl border border-white/25 bg-[#ebaf54] shadow-none transition-all hover:border-white/35 hover:bg-[#fdd3b8] hover:shadow-[0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]"


            disabled={loading}
          >
            <SearchIcon className="h-5 w-5 text-white/80 transition-all group-hover:text-white" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>

      <div
        className={`transition-all duration-700 ${hasSearched ? "w-1/2 opacity-100" : "w-0 opacity-0"}`}
      >
        <DictionaryResult result={result} loading={loading} error={error} />
      </div>
    </div>
  );
}
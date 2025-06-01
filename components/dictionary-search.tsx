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
          {" "}
          <Input
            type="text"
            placeholder="ENTER QUERY..."
            className="h-14 rounded-xl border-2 border-gray-300 bg-white pr-14 pl-4 text-lg text-black shadow-sm transition-all placeholder:text-gray-500 hover:border-gray-400 focus:border-gray-600 focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-2 right-2 h-10 w-10 border-0 bg-transparent shadow-none transition-all hover:bg-gray-100/20"
            disabled={loading}
          >
            <SearchIcon className="h-5 w-5 text-gray-600 transition-all hover:text-gray-800" />
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
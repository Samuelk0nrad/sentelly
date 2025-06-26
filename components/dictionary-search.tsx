"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import DictionaryResult from "@/components/dictionary-result";

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

export default function DictionarySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [result, setResult] = useState<DictionaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Load word from URL parameter on component mount
  useEffect(() => {
    const wordFromUrl = searchParams.get("word");
    if (wordFromUrl) {
      setSearchTerm(wordFromUrl);
      performSearch(wordFromUrl);
    }
  }, [searchParams]);

  const performSearch = async (word: string) => {
    if (!word.trim()) {
      setResult(null);
      setError(null);
      setHasSearched(false);
      // Clear URL parameter when search is empty
      router.push("/", { scroll: false });
      return;
    }
    
    setHasSearched(true);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/dictionary?word=${encodeURIComponent(word)}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch definition");
      }
      const data = await response.json();
      setResult(data);
      
      // Update URL with the searched word
      const params = new URLSearchParams();
      params.set("word", word.trim());
      router.push(`/?${params.toString()}`, { scroll: false });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSearch(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // If input is cleared, clear the URL parameter and reset state
    if (!value.trim()) {
      setResult(null);
      setError(null);
      setHasSearched(false);
      router.push("/", { scroll: false });
    }
  };

  return (
    <div
      className={`w-full transition-all duration-700 ease-in-out ${hasSearched ? "flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8" : "block"}`}
    >
      <form
        onSubmit={handleSearch}
        className={`transition-all duration-700 ${hasSearched ? "w-full md:w-1/2" : "mx-auto w-full max-w-2xl"}`}
      >
        <div className="group relative">
          <Input
            type="text"
            placeholder="ENTER QUERY..."
            className="h-12 md:h-14 rounded-2xl border border-white/50 bg-gray-300/20 pr-12 md:pr-14 pl-3 md:pl-4 text-base md:text-lg text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-all placeholder:text-white/50 hover:border-white/60 focus:border-white/70 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={handleInputChange}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-1.5 md:top-2 right-1.5 md:right-2 h-9 w-9 md:h-10 md:w-10 rounded-xl border border-white/25 bg-[#f7a372] shadow-none transition-all hover:border-white/35 hover:bg-[#fdd3b8] hover:shadow-[0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]"
            disabled={loading}
          >
            <SearchIcon className="h-4 w-4 md:h-5 md:w-5 text-white/80 transition-all group-hover:text-white" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>

      <div
        className={`transition-all duration-700 ${hasSearched ? "w-full md:w-1/2 opacity-100 mt-4 md:mt-0" : "w-0 opacity-0"}`}
      >
        <DictionaryResult result={result} loading={loading} error={error} />
      </div>
    </div>
  );
}
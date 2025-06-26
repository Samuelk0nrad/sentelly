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

  // Perform the actual API call
  const performApiCall = async (word: string) => {
    if (!word.trim()) {
      setResult(null);
      setError(null);
      setHasSearched(false);
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Watch for URL parameter changes and trigger API call
  useEffect(() => {
    const wordFromUrl = searchParams.get("word");
    if (wordFromUrl) {
      setSearchTerm(wordFromUrl);
      performApiCall(wordFromUrl);
    } else {
      // If no word parameter, reset everything
      setSearchTerm("");
      setResult(null);
      setError(null);
      setHasSearched(false);
    }
  }, [searchParams]);

  // Handle form submission - only update URL parameter
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      // Clear URL parameter when search is empty
      router.push("/", { scroll: false });
      return;
    }

    // Only update URL parameter - the useEffect will handle the API call
    const params = new URLSearchParams();
    params.set("word", searchTerm.trim());
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If input is cleared, clear the URL parameter
    if (!value.trim()) {
      router.push("/", { scroll: false });
    }
  };

  return (
    <div
      className={`w-full transition-all duration-700 ease-in-out ${
        hasSearched
          ? "flex flex-col items-center gap-4 pt-4 lg:items-center lg:gap-8 lg:pt-8"
          : "flex min-h-[60vh] items-center justify-center"
      }`}
    >
      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className={`transition-all duration-700 ease-in-out ${
          hasSearched
            ? "w-full lg:w-1/2"
            : "w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl"
        }`}
      >
        <div className="group relative">
          <Input
            type="text"
            placeholder="ENTER QUERY..."
            className="h-10 rounded-xl border border-white/50 bg-gray-300/20 pr-10 pl-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-all placeholder:text-white/50 hover:border-white/60 focus:border-white/70 focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-12 sm:rounded-2xl sm:pr-12 sm:pl-4 sm:text-base md:h-14 md:pr-14 md:pl-5 md:text-lg lg:h-16 lg:pr-16 lg:pl-6 lg:text-xl"
            value={searchTerm}
            onChange={handleInputChange}
            autoFocus
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-1 right-1 h-8 w-8 rounded-lg border border-white/25 bg-[#f7a372] shadow-none transition-all hover:border-white/35 hover:bg-[#fdd3b8] hover:shadow-[0_4px_16px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] sm:top-1.5 sm:right-1.5 sm:h-9 sm:w-9 sm:rounded-xl md:top-2 md:right-2 md:h-10 md:w-10 lg:top-2.5 lg:right-2.5 lg:h-11 lg:w-11"
            disabled={loading}
          >
            <SearchIcon className="h-3 w-3 text-white/80 transition-all group-hover:text-white sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>

      {/* Results Section */}
      {hasSearched && (
        <div
          className={`transition-all duration-700 ease-in-out ${
            hasSearched
              ? "mt-4 w-full opacity-100 lg:mt-0 lg:w-1/2"
              : "w-0 opacity-0"
          }`}
        >
          <DictionaryResult result={result} loading={loading} error={error} />
        </div>
      )}
    </div>
  );
}

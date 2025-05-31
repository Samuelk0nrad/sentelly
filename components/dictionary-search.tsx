"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import DictionaryResult from "@/components/dictionary-result";
import { DictionaryResponse } from "@/lib/types";
import { getDefinition } from "@/app/api/dictionary/route";

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
      const data = await getDefinition(searchTerm);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setResult(null);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div className={`w-full transition-all duration-700 ease-in-out ${hasSearched ? 'flex gap-8 items-center' : 'block'}`}>
      <form onSubmit={handleSearch} className={`transition-all duration-700 ${hasSearched ? 'w-1/2' : 'w-full max-w-2xl mx-auto'}`}>
        <div className="relative group">
          <Input
            type="text"
            placeholder="ENTER QUERY..."
            className="h-14 pl-4 pr-14 text-lg rounded-xl border-2 bg-black/20 backdrop-blur-sm font-mono
                     focus-visible:ring-offset-2 transition-all border-slate-700 hover:border-accent
                     placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <Button 
            type="submit" 
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 transition-all bg-transparense hover:bg-transparense"
            disabled={loading}
          >
            <SearchIcon className="h-5 w-5 text-slate-500 hover:text-slate-100 transition-all" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </form>

      <div className={`transition-all duration-700 ${hasSearched ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}>
        <DictionaryResult result={result} loading={loading} error={error} />
      </div>
    </div>
  );
}
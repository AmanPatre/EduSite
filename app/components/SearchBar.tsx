"use client";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  initialValue?: string;
}

export default function SearchBar({ onSearch, loading, initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
      <div className="relative flex items-center">
        <input
          type="text"
          className="w-full rounded-2xl border border-slate-700 bg-slate-800/50 py-4 pl-6 pr-14 text-lg text-slate-100 shadow-sm transition-all placeholder:text-slate-500 focus:border-purple-500/50 focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-500/10 group-hover:shadow-lg group-hover:shadow-purple-500/5"
          placeholder="What do you want to learn? (e.g. React, Python)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 rounded-xl bg-purple-600 p-2.5 text-white transition hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
}
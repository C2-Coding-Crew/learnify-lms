"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function ExploreFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("cat") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentSearch) {
        updateQuery({ q: searchValue });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/dashboard/student/explore?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Eksplorasi Kursus 🚀</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Temukan ribuan materi belajar berkualitas untuk meningkatkan skill kamu.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isPending ? "text-orange-500 animate-pulse" : "text-slate-400 group-focus-within:text-[#FF6B4A]"}`} size={18} />
              <input 
                type="text" 
                placeholder="Cari kelas apa hari ini?" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm w-full md:w-[350px] outline-none focus:ring-4 focus:ring-orange-50 shadow-sm transition-all font-medium"
              />
              {searchValue && (
                <button 
                  onClick={() => setSearchValue("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  <X size={14} />
                </button>
              )}
           </div>
           {/* Add a simple Category Dropdown or similar if needed, but for now let's just make the search work */}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => updateQuery({ cat: null })}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
            !currentCategory 
              ? "bg-[#FF6B4A] text-white shadow-lg shadow-orange-100" 
              : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
          }`}
        >
          SEMUA KELAS
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateQuery({ cat: cat.slug })}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${
              currentCategory === cat.slug 
                ? "bg-[#FF6B4A] text-white shadow-lg shadow-orange-100" 
                : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

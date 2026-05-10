"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Heart, Star, Users, Clock, BookOpen, ChevronRight } from "lucide-react";

export default function WishlistPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setWishlists(data.wishlists);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const formatPrice = (price: any) => {
    const num = Number(price);
    if (num === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-50 text-green-700";
      case "Intermediate": return "bg-blue-50 text-blue-700";
      case "Advanced": return "bg-purple-50 text-purple-700";
      default: return "bg-slate-50 text-slate-600";
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full transition-colors duration-300 dark:bg-slate-950">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="text-[#FF6B4A]" fill="currentColor" /> Wishlist Kursus
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Lanjutkan kursus impianmu saat kamu siap.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-[#FF6B4A]" size={40} />
          <p className="text-slate-400 font-medium dark:text-slate-500">Memuat wishlist...</p>
        </div>
      ) : wishlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Heart size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Wishlist Masih Kosong</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 max-w-sm text-center">
            Kamu belum menyimpan kursus apa pun. Jelajahi katalog kami dan temukan yang kamu suka.
          </p>
          <Link
            href="/courses"
            className="px-6 py-3 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white font-bold rounded-xl transition-all"
          >
            Jelajahi Kursus
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlists.map((w) => {
            const course = w.course;
            return (
              <Link
                key={w.id}
                href={`/courses/${course.slug}`}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-orange-100/30 dark:hover:shadow-orange-900/10 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-5xl opacity-20 dark:opacity-10">📚</div>
                  </div>
                  <div className={`absolute top-4 left-4 text-[9px] font-bold px-2 py-1 rounded-md ${getLevelColor(course.level)}`}>
                    {course.level}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex text-yellow-400">
                      <Star size={12} fill="currentColor" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {course.rating?.toFixed(1) ?? "0.0"}{" "}
                      <span className="text-slate-300 dark:text-slate-600 font-medium">({course.reviewCount ?? 0})</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-[#FF6B4A] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4 truncate">
                    Oleh {course.instructor?.name}
                  </p>

                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Investasi</span>
                      <span className={`text-lg font-black ${Number(course.price) === 0 ? "text-green-600" : "text-slate-900 dark:text-white"}`}>
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-[#F8F9FF] dark:bg-slate-800 text-[#100E2E] dark:text-white rounded-full flex items-center justify-center group-hover:bg-[#FF6B4A] group-hover:text-white transition-all shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

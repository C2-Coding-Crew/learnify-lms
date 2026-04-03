"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { 
  Search, 
  BookOpen, 
  Clock, 
  Star, 
  LayoutGrid, 
  List, 
  ChevronRight,
  Zap
} from "lucide-react";

const COURSES_DATA = [
  {
    id: 1,
    title: "User Experience (UX) Design Fundamentals",
    category: "Design",
    level: "Beginner",
    duration: "5h 30m",
    lessons: 12,
    rating: 4.8,
    reviews: 120,
    price: 149000,
    isPopular: true,
  },
  {
    id: 2,
    title: "Visual Design and Branding for Startups",
    category: "Branding",
    level: "Intermediate",
    duration: "4h 00m",
    lessons: 8,
    rating: 4.9,
    reviews: 85,
    price: 0,
    isPopular: false,
  },
  {
    id: 3,
    title: "Fullstack Web Development with Next.js 15",
    category: "Development",
    level: "Advanced",
    duration: "12h 45m",
    lessons: 24,
    rating: 5.0,
    reviews: 210,
    price: 299000,
    isPopular: true,
  },
  {
    id: 4,
    title: "Mobile App Development with Kotlin",
    category: "Development",
    level: "Intermediate",
    duration: "8h 15m",
    lessons: 15,
    rating: 4.7,
    reviews: 45,
    price: 199000,
    isPopular: false,
  },
];

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Logic Filtering sederhana untuk simulasi
  const filteredCourses = useMemo(() => {
    return COURSES_DATA.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "Semua" || course.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF6B4A] text-[10px] font-black uppercase tracking-widest">
              <Zap size={12} fill="currentColor" /> Terpercaya oleh 20rb+ Siswa
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Tingkatkan Skill dengan <br />
              <span className="text-[#FF6B4A]">Kurikulum Standar Industri</span>
            </h1>
          </div>
          
          <div className="w-full md:w-[450px] group relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B4A] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Mau belajar apa hari ini?"
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-orange-200 focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- FILTER BAR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {["Semua", "Design", "Development", "Branding"].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
                  activeCategory === cat 
                  ? "bg-[#100E2E] text-white border-[#100E2E]" 
                  : "bg-white text-slate-500 border-slate-100 hover:border-orange-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
            <span>Menampilkan {filteredCourses.length} Kursus</span>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex gap-1">
              <button className="p-2 rounded-lg bg-white border border-slate-100 text-slate-800 shadow-sm"><LayoutGrid size={18} /></button>
              <button className="p-2 rounded-lg bg-transparent text-slate-300"><List size={18} /></button>
            </div>
          </div>
        </div>

        {/* --- COURSE GRID --- */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-100/30 transition-all duration-500 hover:-translate-y-2">
                {/* Thumbnail Container */}
                <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                  {course.isPopular && (
                    <div className="absolute top-4 right-4 z-10 bg-[#FF6B4A] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-lg">
                      Populer
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-full h-full flex items-center justify-center text-slate-200 italic font-bold">
                    Thumbnail
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-slate-800">
                    {course.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex text-yellow-400">
                      <Star size={12} fill="currentColor" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{course.rating} <span className="text-slate-300 font-medium">({course.reviews})</span></span>
                  </div>

                  <h3 className="font-bold text-slate-800 leading-tight mb-4 line-clamp-2 group-hover:text-[#FF6B4A] transition-colors">
                    {course.title}
                  </h3>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#FF6B4A]" /> {course.duration}</span>
                      <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-[#FF6B4A]" /> {course.lessons} Materi</span>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Investasi</span>
                        <span className="text-lg font-black text-slate-900">{formatPrice(course.price)}</span>
                      </div>
                      <button className="w-10 h-10 bg-[#F8F9FF] text-[#100E2E] rounded-full flex items-center justify-center group-hover:bg-[#FF6B4A] group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="text-5xl text-slate-200">🔍</div>
            <h3 className="text-xl font-bold text-slate-800">Kursus tidak ditemukan</h3>
            <p className="text-slate-400">Coba gunakan kata kunci lain atau reset filter.</p>
          </div>
        )}

        {/* --- PAGINATION --- */}
        <div className="mt-20 flex justify-center items-center gap-3">
          <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-800">Prev</button>
          {[1, 2, 3].map((n) => (
            <button key={n} className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${n === 1 ? "bg-[#FF6B4A] text-white shadow-lg shadow-orange-200" : "bg-white text-slate-400 border border-slate-100 hover:border-orange-100"}`}>
              {n}
            </button>
          ))}
          <button className="px-4 py-2 text-sm font-bold text-slate-800">Next</button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
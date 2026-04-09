"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  Zap,
  Users,
  Loader2,
} from "lucide-react";

interface Tag { name: string }
interface Instructor { id: string; name: string; image: string | null }
interface Category { id: number; name: string; slug: string }
interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: Category;
  level: string;
  price: number | string;  // Prisma Decimal serializes as string
  isPopular: boolean;
  totalLessons: number;
  totalMinutes: number;
  rating: number;
  reviewCount: number;
  instructor: Instructor;
  tags: Tag[];
  _count: { enrollments: number };
}

const CATEGORIES = [
  { label: "Semua",       slug: "semua" },
  { label: "Design",      slug: "design" },
  { label: "Development", slug: "development" },
  { label: "Branding",    slug: "branding" },
  { label: "Data Science",slug: "data-science" },
];

const formatPrice = (price: number | string) => {
  const num = Number(price);
  if (num === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner": return "bg-green-50 text-green-700";
    case "Intermediate": return "bg-blue-50 text-blue-700";
    case "Advanced": return "bg-purple-50 text-purple-700";
    default: return "bg-slate-50 text-slate-600";
  }
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("semua");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "semua") params.set("category", activeCategory);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/courses?${params.toString()}`);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Gagal memuat kursus:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchQuery]);

  // Debounce fetch: jalankan 400ms setelah user berhenti mengetik / ganti kategori
  useEffect(() => {
    const timer = setTimeout(() => { fetchCourses(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* --- HEADER --- */}
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
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6B4A] transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Mau belajar apa hari ini?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm outline-none focus:border-orange-200 focus:ring-4 focus:ring-orange-50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* --- FILTER BAR --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm border ${
                  activeCategory === cat.slug
                    ? "bg-[#100E2E] text-white border-[#100E2E]"
                    : "bg-white text-slate-500 border-slate-100 hover:border-orange-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
            <span>
              {isLoading ? "Memuat..." : `Menampilkan ${courses.length} Kursus`}
            </span>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg border shadow-sm transition-all ${
                  viewMode === "grid"
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-transparent border-transparent text-slate-300"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg border shadow-sm transition-all ${
                  viewMode === "list"
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-transparent border-transparent text-slate-300"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* --- LOADING STATE --- */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-[#FF6B4A]" size={40} />
            <p className="text-slate-400 font-medium">Memuat kursus...</p>
          </div>
        )}

        {/* --- COURSE GRID / LIST --- */}
        {!isLoading && courses.length > 0 && (
          <div className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              : "flex flex-col gap-5"
          }>
            {courses.map((course) => (
              viewMode === "grid"
                ? <GridCard key={course.id} course={course} />
                : <ListCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* --- EMPTY STATE --- */}
        {!isLoading && courses.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="text-6xl text-slate-200">🔍</div>
            <h3 className="text-xl font-bold text-slate-800">Kursus tidak ditemukan</h3>
            <p className="text-slate-400">Coba gunakan kata kunci lain atau reset filter.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("Semua"); }}
              className="mt-4 px-6 py-2 bg-[#FF6B4A] text-white rounded-xl font-bold text-sm hover:bg-[#fa5a35] transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// ─── Grid Card Component ──────────────────────────────────────────────────────
function GridCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-orange-100/30 transition-all duration-500 hover:-translate-y-2"
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-orange-50 relative overflow-hidden">
        {course.isPopular && (
          <div className="absolute top-4 right-4 z-10 bg-[#FF6B4A] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase shadow-lg">
            Populer
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-5xl opacity-20">📚</div>
        </div>
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-slate-800">
          {course.category.name}
        </div>
        <div className={`absolute top-4 left-4 text-[9px] font-bold px-2 py-1 rounded-md ${getLevelColor(course.level)}`}>
          {course.level}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex text-yellow-400">
            <Star size={12} fill="currentColor" />
          </div>
          <span className="text-[11px] font-bold text-slate-600">
            {course.rating.toFixed(1)}{" "}
            <span className="text-slate-300 font-medium">({course.reviewCount})</span>
          </span>
          <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1">
            <Users size={10} /> {course._count.enrollments}
          </span>
        </div>

        <h3 className="font-bold text-slate-800 leading-tight mb-3 line-clamp-2 group-hover:text-[#FF6B4A] transition-colors">
          {course.title}
        </h3>

        <p className="text-[11px] text-slate-400 line-clamp-2 mb-4">{course.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 2).map((tag) => (
            <span key={tag.name} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">
              {tag.name}
            </span>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#FF6B4A]" /> {formatDuration(course.totalMinutes)}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#FF6B4A]" /> {course.totalLessons} Materi
            </span>
          </div>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Investasi</span>
              <span className={`text-lg font-black ${Number(course.price) === 0 ? "text-green-600" : "text-slate-900"}`}>
                {formatPrice(course.price)}
              </span>
            </div>
            <div className="w-10 h-10 bg-[#F8F9FF] text-[#100E2E] rounded-full flex items-center justify-center group-hover:bg-[#FF6B4A] group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── List Card Component ──────────────────────────────────────────────────────
function ListCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex gap-6 bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-xl hover:shadow-orange-100/20 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="w-40 h-28 flex-shrink-0 bg-gradient-to-br from-slate-50 to-orange-50 rounded-xl flex items-center justify-center relative overflow-hidden">
        <div className="text-4xl opacity-20">📚</div>
        {course.isPopular && (
          <div className="absolute top-2 right-2 bg-[#FF6B4A] text-white text-[8px] font-black px-2 py-0.5 rounded-full">
            Populer
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#FF6B4A] bg-orange-50 px-2 py-0.5 rounded-md">{course.category.name}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${getLevelColor(course.level)}`}>{course.level}</span>
            </div>
            <h3 className="font-bold text-slate-800 leading-tight group-hover:text-[#FF6B4A] transition-colors line-clamp-1">
              {course.title}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Harga</div>
            <div className={`text-base font-black ${Number(course.price) === 0 ? "text-green-600" : "text-slate-900"}`}>
              {formatPrice(course.price)}
            </div>
          </div>
        </div>

        <p className="text-[12px] text-slate-400 line-clamp-1 mb-3">{course.description}</p>

        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-semibold">
          <span className="flex items-center gap-1">
            <Star size={11} fill="currentColor" className="text-yellow-400" /> {course.rating.toFixed(1)} ({course.reviewCount})
          </span>
          <span className="flex items-center gap-1"><Clock size={11} className="text-[#FF6B4A]" /> {formatDuration(course.totalMinutes)}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} className="text-[#FF6B4A]" /> {course.totalLessons} Materi</span>
          <span className="flex items-center gap-1"><Users size={11} /> {course._count.enrollments} Siswa</span>
        </div>
      </div>

      <div className="flex items-center flex-shrink-0">
        <div className="w-10 h-10 bg-[#F8F9FF] text-[#100E2E] rounded-full flex items-center justify-center group-hover:bg-[#FF6B4A] group-hover:text-white transition-all">
          <ChevronRight size={20} />
        </div>
      </div>
    </Link>
  );
}
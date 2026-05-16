import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Search, Filter, BookOpen, Clock, Star, ArrowRight, Zap, Users, LayoutGrid, List, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExploreFilters } from "@/components/dashboard/student/explore/explore-filters";

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

export default async function ExploreCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const { q, cat } = await searchParams;

  // Ambil kategori untuk filter
  const categories = await db.category.findMany({
    where: { isDeleted: 0, status: 1 },
    orderBy: { name: "asc" },
  });

  // Ambil semua kursus yang sudah dipublish dengan filter
  const courses = await db.course.findMany({
    where: { 
      isPublished: true, 
      isDeleted: 0,
      status: 1,
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ]
      } : {}),
      ...(cat ? {
        category: { slug: cat }
      } : {})
    },
    include: {
      category: true,
      instructor: { select: { name: true, image: true } },
      lessons: { where: { isDeleted: 0, status: 1 } },
      tags: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdDate: "desc" },
  });

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full font-sans">
      <header className="mb-10">
        <ExploreFilters categories={categories} />
      </header>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-50">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Kelas tidak ditemukan</h3>
            <p className="text-slate-400 text-sm mt-2 font-medium max-w-xs mx-auto">
              Maaf, kami tidak menemukan hasil yang cocok dengan kata kunci "{q}". Cobalah kata kunci lain.
            </p>
            <Link href="/dashboard/student/explore">
              <Button 
                variant="outline" 
                className="mt-8 rounded-xl font-bold px-8 h-12"
              >
                Reset Pencarian
              </Button>
            </Link>
          </div>
        ) : (
          courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/student/explore/${course.slug}`}
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
                <img 
                  src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
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
                  <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                    <Users size={10} /> {course._count.enrollments}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 leading-tight mb-3 line-clamp-2 group-hover:text-[#FF6B4A] transition-colors">
                  {course.title}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 font-medium italic">{course.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.tags.slice(0, 2).map((tag: any) => (
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
                      <BookOpen size={14} className="text-[#FF6B4A]" /> {course.lessons.length} Materi
                    </span>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Investasi</span>
                      <span className={`text-lg font-black ${Number(course.price) === 0 ? "text-green-600" : "text-slate-900"}`}>
                        {formatPrice(Number(course.price))}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-[#F8F9FF] text-[#100E2E] rounded-full flex items-center justify-center group-hover:bg-[#FF6B4A] group-hover:text-white transition-all shadow-sm">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}

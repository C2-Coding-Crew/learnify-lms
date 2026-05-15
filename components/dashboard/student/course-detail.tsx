"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Clock,
  BookOpen,
  Users,
  Award,
  ChevronRight,
  Play,
  Lock,
  CheckCircle,
  ArrowLeft,
  Tag,
  BarChart2,
  Globe,
  Zap,
  Heart,
  Loader2,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ─── Star Rating Picker ────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hover || value) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Reviews Section ──────────────────────────────────────────────────────────
function ReviewsSection({ courseSlug, isEnrolled }: { courseSlug: string; isEnrolled: boolean }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${courseSlug}/reviews?limit=5`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setMeta(data.meta || null);
      })
      .finally(() => setIsLoading(false));
  }, [courseSlug]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Pilih bintang dulu", { description: "Rating wajib diisi (1-5 bintang)." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${courseSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim ulasan");

      toast.success("Ulasan terkirim! 🎉", { description: "Terima kasih atas feedback-mu." });
      setRating(0);
      setComment("");
      // Refresh reviews
      const refreshed = await fetch(`/api/courses/${courseSlug}/reviews?limit=5`).then(r => r.json());
      setReviews(refreshed.reviews || []);
      setMeta(refreshed.meta || null);
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ["", "Kurang", "Cukup", "Bagus", "Sangat Bagus", "Luar Biasa!"];

  return (
    <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
          <MessageSquare size={22} className="text-[#FF6B4A]" /> Ulasan Siswa
        </h2>
        {meta && (
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl">
            <Star size={16} fill="#FBBF24" className="text-yellow-400" />
            <span className="font-black text-slate-800">{Number(meta.averageRating).toFixed(1)}</span>
            <span className="text-slate-400 text-xs font-medium">({meta.reviewCount} ulasan)</span>
          </div>
        )}
      </div>

      {/* Write Review Form — only for enrolled students */}
      {isEnrolled && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-6 mb-8">
          <h3 className="font-black text-slate-800 mb-4">Bagikan Pengalamanmu</h3>
          <div className="flex items-center gap-4 mb-4">
            <StarPicker value={rating} onChange={setRating} />
            {rating > 0 && (
              <span className="text-sm font-bold text-amber-600 animate-in fade-in duration-200">
                {ratingLabels[rating]}
              </span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            placeholder="Ceritakan pengalamanmu mengikuti kursus ini..."
            className="w-full px-4 py-3 bg-white border border-orange-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium resize-none mb-3"
          />
          <Button
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-2xl h-11 px-6 font-black shadow-lg shadow-orange-100"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
            Kirim Ulasan
          </Button>
        </div>
      )}

      {/* Review List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-slate-300" size={32} />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <MessageSquare size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="font-bold">Belum ada ulasan. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review: any) => (
            <div key={review.id} className="flex gap-4 p-5 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-colors">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                <img
                  src={review.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.name}`}
                  alt={review.user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-black text-sm text-slate-800">{review.user.name}</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-500 leading-relaxed">{review.comment}</p>
                )}
                <p className="text-[10px] text-slate-300 font-medium mt-2">
                  {new Date(review.createdDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  order: number;
  isFree: boolean;
}

interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  category: { name: string; slug: string };
  level: string;
  price: number;
  isPopular: boolean;
  totalLessons: number;
  totalMinutes: number;
  rating: number;
  reviewCount: number;
  instructor: { id: string; name: string; image: string | null; email: string };
  lessons: Lesson[];
  tags: { name: string }[];
  _count: { enrollments: number };
}

const formatPrice = (price: number) => {
  if (price === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} jam ${m > 0 ? `${m} menit` : ""}`.trim() : `${m} menit`;
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":     return "bg-green-100 text-green-700";
    case "Intermediate": return "bg-blue-100 text-blue-700";
    case "Advanced":     return "bg-purple-100 text-purple-700";
    default:             return "bg-slate-100 text-slate-600";
  }
};

export default function StudentCourseDetail({ course }: { course: CourseDetail }) {
  const router = useRouter();
  
  const [enrollmentStatus, setEnrollmentStatus] = useState<{ isEnrolled: boolean; enrollment: any | null }>({
    isEnrolled: false,
    enrollment: null,
  });
  const [statusLoading, setStatusLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/courses/${course.slug}/enrollment-status`);
        const data = await res.json();
        setEnrollmentStatus(data);
      } catch {
        // Safe default
      } finally {
        setStatusLoading(false);
      }
    };
    checkStatus();
  }, [course.slug]);

  const handleEnroll = async () => {
    if (enrollmentStatus.isEnrolled) {
      router.push(`/courses/${course.slug}/learn`);
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mendaftar");

      if (data.type === "free") {
        toast.success("🎉 Berhasil mendaftar! Selamat belajar!");
        setEnrollmentStatus({ isEnrolled: true, enrollment: data.enrollment });
        setTimeout(() => router.push(data.redirectUrl), 1000);
      } else {
        toast.info("Invoice berhasil dibuat. Melanjutkan ke pembayaran...");
        router.push(data.redirectUrl);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full font-sans">
      {/* Header / Back Button */}
      <div className="mb-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-sm transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Eksplorasi
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
        {/* Left Column: Info */}
        <div className="space-y-10">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex flex-wrap items-center gap-3 mb-6">
                {course.isPopular && (
                  <span className="bg-[#FF6B4A] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> Populer
                  </span>
                )}
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                  {course.category.name}
                </span>
             </div>

             <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight mb-6">
                {course.title}
             </h1>

             <p className="text-slate-500 text-sm leading-relaxed mb-8">
                {course.description}
             </p>

             <div className="flex flex-wrap items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm ring-1 ring-slate-100">
                      <img src={course.instructor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.name}`} alt={course.instructor.name} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Instruktur</p>
                      <p className="text-sm font-bold text-slate-700">{course.instructor.name}</p>
                   </div>
                </div>
                <div className="h-8 w-[1px] bg-slate-100 hidden md:block" />
                <div className="flex items-center gap-2">
                   <Star size={18} fill="#FBBF24" className="text-yellow-400" />
                   <span className="text-sm font-black text-slate-700">{course.rating.toFixed(1)} <span className="text-slate-300 font-bold ml-1">({course.reviewCount})</span></span>
                </div>
                <div className="flex items-center gap-2">
                   <Users size={18} className="text-indigo-400" />
                   <span className="text-sm font-black text-slate-700">{course._count.enrollments.toLocaleString("id-ID")} <span className="text-slate-300 font-bold ml-1 text-xs">Siswa</span></span>
                </div>
             </div>
          </section>

          {/* What you'll learn */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
             <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <CheckCircle size={22} className="text-green-500" /> Kurikulum Belajar
             </h2>
             <div className="grid md:grid-cols-2 gap-4 relative z-10">
                {[
                  "Membangun fondasi berpikir kritis",
                  "Mempelajari standar industri terbaru",
                  "Praktik dengan studi kasus nyata",
                  "Optimasi alur kerja profesional",
                  "Akses komunitas eksklusif",
                  "Sertifikat kelulusan premium"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl text-sm font-bold text-slate-600">
                    <CheckCircle size={16} className="text-green-400" /> {item}
                  </div>
                ))}
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-30" />
          </section>

          {/* Syllabus */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                   <BookOpen size={22} className="text-[#FF6B4A]" /> Silabus Materi
                </h2>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{course.totalLessons} Materi</span>
             </div>
             <div className="space-y-3">
                {course.lessons.map((lesson, idx) => (
                   <div key={lesson.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-100 transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-[#FF6B4A] group-hover:text-white transition-all shadow-sm font-black text-sm">
                         {idx + 1}
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-black text-slate-700">{lesson.title}</h4>
                         <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{lesson.duration} Menit</p>
                      </div>
                      {lesson.isFree ? (
                         <span className="text-[10px] font-black text-green-600 bg-green-100 px-3 py-1 rounded-full uppercase">Free</span>
                      ) : (
                         <Lock size={16} className="text-slate-300" />
                      )}
                   </div>
                ))}
             </div>
          </section>

          {/* Reviews */}
          <ReviewsSection courseSlug={course.slug} isEnrolled={enrollmentStatus.isEnrolled} />
        </div>

        {/* Right Column: Purchase / Status Card */}
        <div className="sticky top-10 space-y-6">
           <div className={`bg-white p-8 rounded-[3rem] border-2 shadow-2xl transition-all ${enrollmentStatus.isEnrolled ? "border-green-100 shadow-green-100/50" : "border-slate-50 shadow-slate-200/50"}`}>
              <div className="aspect-video bg-slate-100 rounded-[2rem] mb-8 overflow-hidden relative shadow-inner">
                 <img src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-16 h-16 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                       <Play size={28} fill="#FF6B4A" className="text-[#FF6B4A] ml-1" />
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Investasi Ilmu</p>
                    <p className={`text-3xl font-black ${course.price === 0 || enrollmentStatus.isEnrolled ? "text-green-600" : "text-slate-900"}`}>
                       {enrollmentStatus.isEnrolled ? "Sudah Terdaftar" : formatPrice(course.price)}
                    </p>
                 </div>

                 <Button 
                    onClick={handleEnroll}
                    disabled={isEnrolling || statusLoading}
                    className={`w-full py-8 rounded-[1.5rem] text-sm font-black shadow-xl transition-all active:scale-95 ${
                      enrollmentStatus.isEnrolled 
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200" 
                        : "bg-[#FF6B4A] hover:bg-[#fa5a35] text-white shadow-orange-200"
                    }`}
                 >
                    {statusLoading ? "Memuat..." : isEnrolling ? "Memproses..." : enrollmentStatus.isEnrolled ? "🎓 Lanjut Belajar Sekarang" : course.price === 0 ? "🎉 Daftar Gratis Sekarang" : "Beli Kursus Sekarang →"}
                 </Button>

                 <div className="space-y-4 pt-6 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Yang Akan Kamu Dapat:</p>
                    {[
                      { icon: <Play size={14} />, text: "Akses Seumur Hidup" },
                      { icon: <ShieldCheck size={14} />, text: "Kualitas Video Premium" },
                      { icon: <Award size={14} />, text: "Sertifikat Digital" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <div className="text-[#FF6B4A]">{item.icon}</div> {item.text}
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Instructor Quick Profile */}
           <div className="bg-[#100E2E] p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="relative z-10 flex items-center gap-4 mb-6">
                 <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/20">
                    <img src={course.instructor.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.name}`} />
                 </div>
                 <div>
                    <h4 className="font-black text-lg">{course.instructor.name}</h4>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Master Instructor</p>
                 </div>
              </div>
              <p className="text-xs text-white/50 leading-relaxed relative z-10 font-medium">
                 Berpengalaman lebih dari 10 tahun di bidang {course.category.name}. Telah membimbing ribuan siswa sukses di karir mereka.
              </p>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B4A]/20 rounded-full blur-[60px]" />
           </div>
        </div>
      </div>
    </main>
  );
}

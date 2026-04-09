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
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import type { EnrollmentStatusCheck } from "@/types/enrollment";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CourseDetailClient({ course }: { course: CourseDetail }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Enrollment state
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatusCheck>({
    isEnrolled: false,
    enrollment: null,
  });
  const [statusLoading, setStatusLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // UI state
  const [expandedLessons, setExpandedLessons] = useState(false);
  const [savedCourse, setSavedCourse] = useState(false);

  const freeLessons = course.lessons.filter((l) => l.isFree);
  const displayedLessons = expandedLessons ? course.lessons : course.lessons.slice(0, 5);

  // ─── Fetch enrollment status saat komponen mount ───────────────────────────
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/courses/${course.slug}/enrollment-status`);
        const data: EnrollmentStatusCheck = await res.json();
        setEnrollmentStatus(data);
      } catch {
        // Jika gagal, anggap belum enroll (safe default)
      } finally {
        setStatusLoading(false);
      }
    };
    checkStatus();
  }, [course.slug]);

  // ─── Handle Enroll ────────────────────────────────────────────────────────
  const handleEnroll = async () => {
    // 1. Belum login → redirect ke login
    if (!session && !sessionLoading) {
      router.push(`/auth/login?callbackUrl=/courses/${course.slug}`);
      return;
    }

    // 2. Sudah enroll → langsung ke halaman belajar
    if (enrollmentStatus.isEnrolled) {
      router.push(`/courses/${course.slug}/learn`);
      return;
    }

    // 3. Proses enrollment
    setIsEnrolling(true);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 409 = sudah enroll (race condition)
        if (res.status === 409) {
          setEnrollmentStatus({ isEnrolled: true, enrollment: data.enrollment });
          router.push(`/courses/${course.slug}/learn`);
          return;
        }
        throw new Error(data.error ?? "Gagal mendaftar kursus");
      }

      if (data.type === "free") {
        // Free course: langsung ke halaman belajar
        toast.success("🎉 Berhasil mendaftar! Selamat belajar!");
        setEnrollmentStatus({ isEnrolled: true, enrollment: data.enrollment });
        setTimeout(() => router.push(data.redirectUrl), 1000);
      } else {
        // Paid course: ke halaman checkout
        toast.info("Invoice berhasil dibuat. Melanjutkan ke pembayaran...");
        router.push(data.redirectUrl);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsEnrolling(false);
    }
  };

  const buttonState = (() => {
    if (sessionLoading || statusLoading) return { label: "Memuat...", disabled: true };
    if (enrollmentStatus.isEnrolled) return { label: "🎓 Lanjut Belajar", disabled: false };
    if (isEnrolling) return { label: "Mendaftar...", disabled: true };
    if (course.price === 0) return { label: "🎉 Daftar Gratis Sekarang", disabled: false };
    return { label: `Enroll — ${formatPrice(course.price)}`, disabled: false };
  })();

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO / HEADER ── */}
      <section className="bg-[#100E2E] text-white pt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-white/40 mb-6 font-medium">
            <Link href="/" className="hover:text-white/70 transition-colors">Beranda</Link>
            <ChevronRight size={12} />
            <Link href="/courses" className="hover:text-white/70 transition-colors">Kursus</Link>
            <ChevronRight size={12} />
            <span className="text-white/60">{course.category.name}</span>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
            {/* LEFT: Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {course.isPopular && (
                  <span className="bg-[#FF6B4A] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                    <Zap size={10} fill="currentColor" /> Populer
                  </span>
                )}
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 text-white/70">
                  {course.category.name}
                </span>
                {enrollmentStatus.isEnrolled && (
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                    <CheckCircle size={10} /> Sudah Terdaftar
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4 tracking-tight">
                {course.title}
              </h1>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-2xl">
                {course.description}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-5 text-sm mb-6">
                <div className="flex items-center gap-1.5">
                  <Star size={16} fill="#FBBF24" className="text-yellow-400" />
                  <span className="font-bold">{course.rating.toFixed(1)}</span>
                  <span className="text-white/40">({course.reviewCount} ulasan)</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60">
                  <Users size={14} />
                  <span>{course._count.enrollments.toLocaleString("id-ID")} siswa</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60">
                  <BookOpen size={14} />
                  <span>{course.totalLessons} materi</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60">
                  <Clock size={14} />
                  <span>{formatDuration(course.totalMinutes)}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3">
                <img
                  src={course.instructor.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.name}`}
                  alt={course.instructor.name}
                  className="w-10 h-10 rounded-full bg-white/10"
                />
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Instruktur</p>
                  <p className="text-sm font-bold text-white">{course.instructor.name}</p>
                </div>
              </div>
            </div>

            {/* RIGHT: Purchase Card (desktop) */}
            <div className="hidden lg:block">
              <PurchaseCard
                course={course}
                freeLessons={freeLessons.length}
                buttonState={buttonState}
                isEnrolling={isEnrolling}
                savedCourse={savedCourse}
                isEnrolled={enrollmentStatus.isEnrolled}
                onEnroll={handleEnroll}
                onSave={() => setSavedCourse(!savedCourse)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
          <div className="space-y-10">

            {/* Enrolled Banner */}
            {enrollmentStatus.isEnrolled && (
              <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-5">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-800">Kamu sudah terdaftar di kursus ini!</p>
                  <p className="text-sm text-green-600">
                    Terdaftar sejak {new Date(enrollmentStatus.enrollment!.enrolledAt).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/courses/${course.slug}/learn`)}
                  className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  Lanjut Belajar <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* What You'll Learn */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                <CheckCircle size={20} className="text-[#FF6B4A]" /> Apa yang Akan Kamu Pelajari
              </h2>
              <div className="grid sm:grid-cols-2 gap-3 bg-slate-50 rounded-2xl p-6">
                {[
                  "Memahami konsep fundamental dari awal",
                  "Praktik langsung dengan proyek nyata",
                  "Best practice standar industri",
                  "Tips & trik dari instruktur profesional",
                  "Portfolio siap untuk melamar kerja",
                  `Sertifikat ${course.category.name} dari Learnify`,
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </section>

            {/* Course Stats */}
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                <BarChart2 size={20} className="text-[#FF6B4A]" /> Detail Kursus
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: <BookOpen size={20} />, label: "Total Materi", value: `${course.totalLessons} Lesson` },
                  { icon: <Clock size={20} />, label: "Total Durasi", value: formatDuration(course.totalMinutes) },
                  { icon: <Award size={20} />, label: "Level", value: course.level },
                  { icon: <Globe size={20} />, label: "Bahasa", value: "Indonesia" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center text-center bg-slate-50 rounded-2xl p-4 gap-2">
                    <div className="text-[#FF6B4A]">{stat.icon}</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="font-black text-slate-800 text-sm">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Silabus */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-[#FF6B4A]" /> Silabus Kursus
                </h2>
                <span className="text-xs text-slate-400 font-semibold">
                  {freeLessons.length} gratis · {course.totalLessons} total
                </span>
              </div>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                {displayedLessons.map((lesson, idx) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={idx}
                    isEnrolled={enrollmentStatus.isEnrolled}
                    courseSlug={course.slug}
                  />
                ))}
              </div>
              {course.lessons.length > 5 && (
                <button
                  onClick={() => setExpandedLessons(!expandedLessons)}
                  className="mt-4 w-full py-3 text-sm font-bold text-[#FF6B4A] border-2 border-dashed border-orange-200 rounded-2xl hover:bg-orange-50 transition-colors"
                >
                  {expandedLessons
                    ? "Sembunyikan materi"
                    : `Tampilkan ${course.lessons.length - 5} materi lainnya`}
                </button>
              )}
            </section>

            {/* Tags */}
            {course.tags.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Tag size={20} className="text-[#FF6B4A]" /> Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag.name}
                      className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-orange-50 hover:text-[#FF6B4A] transition-colors"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Instructor */}
            <section className="bg-gradient-to-br from-slate-50 to-orange-50/30 rounded-3xl p-6">
              <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                <Users size={20} className="text-[#FF6B4A]" /> Tentang Instruktur
              </h2>
              <div className="flex items-start gap-4">
                <img
                  src={course.instructor.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor.name}`}
                  alt={course.instructor.name}
                  className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0"
                />
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{course.instructor.name}</h3>
                  <p className="text-sm text-[#FF6B4A] font-bold mb-2">Instruktur {course.category.name}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Instruktur profesional dengan pengalaman bertahun-tahun di industri. Fokus pada pembelajaran praktis yang langsung bisa diterapkan.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Sticky Purchase Card (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <PurchaseCard
                course={course}
                freeLessons={freeLessons.length}
                buttonState={buttonState}
                isEnrolling={isEnrolling}
                savedCourse={savedCourse}
                isEnrolled={enrollmentStatus.isEnrolled}
                onEnroll={handleEnroll}
                onSave={() => setSavedCourse(!savedCourse)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM CTA ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-xl z-50">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              {enrollmentStatus.isEnrolled ? "Status" : "Harga"}
            </p>
            <p className={`text-lg font-black ${enrollmentStatus.isEnrolled ? "text-green-600" : course.price === 0 ? "text-green-600" : "text-slate-900"}`}>
              {enrollmentStatus.isEnrolled ? "Sudah Enroll ✓" : formatPrice(course.price)}
            </p>
          </div>
          <button
            onClick={handleEnroll}
            disabled={buttonState.disabled}
            className="flex-1 h-12 bg-[#FF6B4A] text-white font-black rounded-2xl hover:bg-[#fa5a35] transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isEnrolling ? (
              <Loader2 size={20} className="animate-spin" />
            ) : enrollmentStatus.isEnrolled ? (
              <><GraduationCap size={18} /> Lanjut Belajar</>
            ) : (
              <>{course.price === 0 ? "Daftar Gratis" : "Enroll Sekarang"} <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>

      <div className="pb-24 lg:pb-0" />
      <Footer />
    </div>
  );
}

// ─── Purchase Card ─────────────────────────────────────────────────────────────
function PurchaseCard({
  course,
  freeLessons,
  buttonState,
  isEnrolling,
  savedCourse,
  isEnrolled,
  onEnroll,
  onSave,
}: {
  course: CourseDetail;
  freeLessons: number;
  buttonState: { label: string; disabled: boolean };
  isEnrolling: boolean;
  savedCourse: boolean;
  isEnrolled: boolean;
  onEnroll: () => void;
  onSave: () => void;
}) {
  return (
    <div className={`bg-white rounded-3xl border overflow-hidden shadow-2xl shadow-slate-200/60 ${isEnrolled ? "border-green-200" : "border-slate-100"}`}>
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-[#100E2E] to-[#FF6B4A]/30 relative flex items-center justify-center">
        {isEnrolled ? (
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-green-400/50">
              <GraduationCap size={28} className="text-green-400" />
            </div>
            <p className="text-white/60 text-xs font-bold">Kamu terdaftar di kursus ini</p>
          </div>
        ) : (
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors">
            <Play size={28} fill="white" className="text-white ml-1" />
          </div>
        )}
        {!isEnrolled && (
          <div className="absolute bottom-3 left-3 text-white/60 text-[10px] font-bold">
            Preview Gratis ({freeLessons} materi)
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Price / Status */}
        <div className="flex items-end justify-between">
          <div>
            {isEnrolled ? (
              <>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">Status</p>
                <p className="text-2xl font-black text-green-600 flex items-center gap-2">
                  <CheckCircle size={22} /> Sudah Terdaftar
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                  {course.price === 0 ? "Kursus ini" : "Harga"}
                </p>
                <p className={`text-3xl font-black ${course.price === 0 ? "text-green-600" : "text-slate-900"}`}>
                  {formatPrice(course.price)}
                </p>
              </>
            )}
          </div>
          {!isEnrolled && course.price > 0 && (
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">Hemat 40%</span>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={onEnroll}
            disabled={buttonState.disabled}
            className={`w-full h-13 font-black rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 py-4 shadow-lg ${
              isEnrolled
                ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200/50"
                : "bg-[#FF6B4A] hover:bg-[#fa5a35] text-white shadow-orange-200/50"
            }`}
          >
            {isEnrolling ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>{buttonState.label} {!isEnrolled && <ChevronRight size={18} />}</>
            )}
          </button>

          {!isEnrolled && (
            <button
              onClick={onSave}
              className={`w-full h-11 border-2 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                savedCourse
                  ? "border-red-200 text-red-500 bg-red-50"
                  : "border-slate-200 text-slate-600 hover:border-orange-200"
              }`}
            >
              <Heart size={16} fill={savedCourse ? "currentColor" : "none"} />
              {savedCourse ? "Tersimpan" : "Simpan untuk Nanti"}
            </button>
          )}
        </div>

        {/* What's included */}
        <div className="border-t border-slate-50 pt-4 space-y-2.5">
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Yang Kamu Dapatkan:</p>
          {[
            { icon: <BookOpen size={14} />, text: `${course.totalLessons} materi video` },
            { icon: <Clock size={14} />, text: `${formatDuration(course.totalMinutes)} konten` },
            { icon: <Globe size={14} />, text: "Akses seumur hidup" },
            { icon: <Award size={14} />, text: "Sertifikat penyelesaian" },
            { icon: <Users size={14} />, text: "Akses komunitas Discord" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2.5 text-xs text-slate-600">
              <span className="text-[#FF6B4A]">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        <Link
          href="/courses"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors justify-center pt-2"
        >
          <ArrowLeft size={12} /> Lihat kursus lainnya
        </Link>
      </div>
    </div>
  );
}

// ─── Lesson Row ───────────────────────────────────────────────────────────────
function LessonRow({
  lesson,
  index,
  isEnrolled,
  courseSlug,
}: {
  lesson: Lesson;
  index: number;
  isEnrolled: boolean;
  courseSlug: string;
}) {
  const isAccessible = lesson.isFree || isEnrolled;

  const content = (
    <div
      className={`flex items-center gap-4 px-5 py-4 transition-colors ${
        index > 0 ? "border-t border-slate-50" : ""
      } ${isAccessible ? "hover:bg-orange-50/50 cursor-pointer" : "bg-white cursor-not-allowed"}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black ${
        isAccessible ? "bg-orange-100 text-[#FF6B4A]" : "bg-slate-100 text-slate-400"
      }`}>
        {isAccessible ? <Play size={12} fill="currentColor" /> : <Lock size={12} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${isAccessible ? "text-slate-800" : "text-slate-400"}`}>
          {lesson.order}. {lesson.title}
        </p>
        {lesson.description && (
          <p className="text-[11px] text-slate-400 truncate mt-0.5">{lesson.description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {lesson.isFree && !isEnrolled && (
          <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase">Gratis</span>
        )}
        {isEnrolled && (
          <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase">Buka</span>
        )}
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Clock size={10} /> {lesson.duration}m
        </span>
      </div>
    </div>
  );

  if (isAccessible) {
    return (
      <Link href={`/courses/${courseSlug}/learn?lesson=${lesson.id}`}>
        {content}
      </Link>
    );
  }
  return content;
}

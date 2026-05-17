"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Play,
  BarChart2,
  Menu,
  X,
  FileQuestion,
  Award,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import QuizPlayer from "./quiz-player";
import CustomVideoPlayer from "./custom-video-player";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lesson {
  id: number;
  title: string;
  duration: number;
  order: number;
  isFree: boolean;
  description: string | null;
  videoUrl: string | null;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  totalLessons: number;
  category: { name: string; slug: string };
  instructor: { name: string; image: string | null };
  lessons: Lesson[];
  quizzes: {
    id: number;
    lessonId: number | null;
    title: string;
    description: string | null;
    questionCount: number;
    passingScore: number;
  }[];
  announcements: {
    id: number;
    title: string;
    content: string;
    createdDate: string;
  }[];
}

interface Props {
  course: Course;
  activeLessonId: number | null;
  progressMap: Record<string, { isCompleted: boolean; watchedSecs: number }>;
  progressPercent: number;
  completedCount: number;
  userId: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LearnPageClient({
  course,
  activeLessonId,
  progressMap: initialProgress,
  progressPercent: initialPercent,
  completedCount: initialCompleted,
  userId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentLessonId, setCurrentLessonId] = useState(activeLessonId ?? course.lessons[0]?.id);
  const [progressMap, setProgressMap] = useState(initialProgress);
  const [progressPercent, setProgressPercent] = useState(initialPercent);
  const [completedCount, setCompletedCount] = useState(initialCompleted);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quiz State
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  const currentLesson = course.lessons.find((l) => l.id === currentLessonId) ?? course.lessons[0];
  const currentIndex = course.lessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  const isCompleted = !!progressMap[String(currentLessonId)]?.isCompleted;

  // Find quiz for current lesson
  const currentQuiz = course.quizzes.find(q => q.lessonId === currentLessonId);

  const navigateLesson = (lessonId: number) => {
    setCurrentLessonId(lessonId);
    setSidebarOpen(false);
    router.replace(`/courses/${course.slug}/learn?lesson=${lessonId}`, { scroll: false });
  };

  const markComplete = async () => {
    if (isCompleted) {
      navigateLesson(nextLesson?.id ?? currentLessonId);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: currentLessonId,
            isCompleted: true,
          }),
        });

        if (!res.ok) throw new Error("Gagal menyimpan progress");

        // Update local state
        const newMap = {
          ...progressMap,
          [String(currentLessonId)]: { isCompleted: true, watchedSecs: currentLesson.duration * 60 },
        };
        const newCompleted = Object.values(newMap).filter((p) => p.isCompleted).length;
        const newPercent = Math.round((newCompleted / course.totalLessons) * 100);

        setProgressMap(newMap);
        setCompletedCount(newCompleted);
        setProgressPercent(newPercent);

        if (newPercent === 100) {
          toast.success("🏆 Selamat! Kamu menyelesaikan kursus ini!");
        } else {
          toast.success("✅ Lesson selesai!");
          if (nextLesson) setTimeout(() => navigateLesson(nextLesson.id), 800);
        }
      } catch {
        toast.error("Gagal menyimpan progress");
      }
    });
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("embed/")) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-[#1A1A2E] border-r border-white/5
        transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/5">
          <Link
            href={`/dashboard/student/explore/${course.slug}`}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors mb-4"
          >
            <ChevronLeft size={14} /> Kembali ke Detail
          </Link>
          <h2 className="text-sm font-bold text-white leading-tight line-clamp-2">{course.title}</h2>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[10px] text-white/40 font-medium">
              <span>{completedCount} / {course.totalLessons} selesai</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B4A] to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto py-2">
          {course.lessons.map((lesson) => {
            const done = !!progressMap[String(lesson.id)]?.isCompleted;
            const active = lesson.id === currentLessonId;
            return (
              <button
                key={lesson.id}
                onClick={() => navigateLesson(lesson.id)}
                className={`w-full text-left px-5 py-3.5 flex items-center gap-3 transition-colors ${
                  active
                    ? "bg-[#FF6B4A]/15 border-r-2 border-[#FF6B4A]"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {done ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : active ? (
                    <Play size={16} className="text-[#FF6B4A]" fill="currentColor" />
                  ) : (
                    <Circle size={16} className="text-white/20" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold truncate ${active ? "text-white" : done ? "text-white/50" : "text-white/70"}`}>
                    {lesson.order}. {lesson.title}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">{lesson.duration} menit</p>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-white/5 px-6 flex items-center gap-4 flex-shrink-0 bg-[#0F0F1A]">
          <button
            className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="text-xs text-white/40 font-medium">
            Lesson {currentIndex + 1} dari {course.lessons.length}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-white/40">
              <BarChart2 size={12} /> {progressPercent}% selesai
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Video Area */}
          <div className="aspect-video max-h-[55vh] bg-black w-full flex items-center justify-center relative">
            {currentLesson?.videoUrl ? (
              <CustomVideoPlayer videoUrl={currentLesson.videoUrl} lessonId={currentLessonId} />
            ) : (
              <div className="text-center space-y-4 p-8">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                  <Play size={32} className="text-white/30" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{currentLesson?.title}</p>
                  <p className="text-white/40 text-sm mt-1">Video akan tersedia setelah instruktur mengupload konten</p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-white/30 bg-white/5 px-4 py-2 rounded-full">
                  <Clock size={12} /> Durasi: {currentLesson?.duration} menit
                </div>
              </div>
            )}
          </div>

          {/* Quiz Notification / Start Button */}
          {currentQuiz && !isQuizOpen && (
            <div className="mx-6 mt-6 p-6 bg-indigo-600 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <FileQuestion size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-black text-white text-lg">Waktunya Kuis! 📝</h4>
                  <p className="text-indigo-100 text-sm font-medium">Uji pemahamanmu tentang materi {currentLesson?.title}</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setActiveQuizId(currentQuiz.id);
                  setIsQuizOpen(true);
                }}
                className="bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl h-12 px-8 font-black shadow-xl shadow-indigo-900/20"
              >
                Mulai Kuis Sekarang
              </Button>
            </div>
          )}

          {/* Quiz Player Overlay */}
          {isQuizOpen && activeQuizId && (
            <div className="fixed inset-0 z-50 bg-[#0F0F1A] overflow-y-auto pt-10">
              <QuizPlayer 
                quizId={activeQuizId}
                onClose={() => setIsQuizOpen(false)}
                onComplete={(result) => {
                  if (result.isPassed) {
                    toast.success("Skor kamu: " + Math.round(result.score) + "%. Kamu lulus!");
                    // Optional: auto mark complete lesson if passed quiz
                    markComplete();
                  } else {
                    toast.error("Skor kamu: " + Math.round(result.score) + "%. Kamu belum lulus.");
                  }
                  setIsQuizOpen(false);
                }}
              />
            </div>
          )}

          {/* Lesson Info + Controls */}
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] text-[#FF6B4A] font-bold uppercase tracking-widest mb-2">
                    Lesson {currentLesson?.order}
                  </p>
                  <h1 className="text-2xl font-black text-white leading-tight">{currentLesson?.title}</h1>
                  {currentLesson?.description && (
                    <p className="text-white/50 text-sm mt-2 leading-relaxed">{currentLesson.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-white/40 text-xs flex-shrink-0">
                  <Clock size={12} /> {currentLesson?.duration} menit
                </div>
              </div>
            </div>

            {/* Navigation + Complete */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => prevLesson && navigateLesson(prevLesson.id)}
                disabled={!prevLesson}
                className="h-10 px-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <button
                onClick={markComplete}
                disabled={isPending}
                className={`flex-1 h-10 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                  isCompleted
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-[#FF6B4A] hover:bg-[#fa5a35] text-white"
                }`}
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isCompleted ? (
                  <><CheckCircle size={16} /> Selesai — Lanjut</>
                ) : (
                  <><BookOpen size={16} /> Tandai Selesai</>
                )}
              </button>

              <button
                onClick={() => nextLesson && navigateLesson(nextLesson.id)}
                disabled={!nextLesson}
                className="h-10 px-4 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Announcements Section */}
          {course.announcements.length > 0 && (
            <div className="max-w-4xl mx-auto px-6 pb-12">
              <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-[#FF6B4A]/10 text-[#FF6B4A] rounded-lg flex items-center justify-center">
                    <Megaphone size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Pengumuman 📢</h3>
                  </div>
                </div>

                <div className="grid gap-3">
                  {course.announcements.map((ann) => (
                    <div key={ann.id} className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-bold text-sm text-white/90 leading-tight">{ann.title}</h4>
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest whitespace-nowrap">
                          {new Date(ann.createdDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

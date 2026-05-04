"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Video,
  Clock,
  ChevronRight,
  ChevronLeft,
  Play,
  MoreVertical,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Todo {
  id: number;
  task: string;
  date: string;
  done: boolean;
}

interface Course {
  id: number;
  slug?: string;
  title: string;
  time: string;
  lessons: string;
  progress: number;
  active: boolean;
}

interface StudentDashboardProps {
  /** User ID — used as localStorage namespace key */
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string | number;
  twoFactorEnabled?: boolean;
  enrolledCourses?: Course[];
  /** Study hours per day for the last 5 days (Mon → Fri order) */
  weeklyHours?: number[];
  /** Overall average course progress (0–100) */
  avgProgress?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SVG_CIRCUMFERENCE = 339.29; // 2π × 54
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const getTodoKey = (userId: string) => `learnify_todos_${userId}`;

// ── Pure helpers ──────────────────────────────────────────────────────────────
const calcSvgOffset = (pct: number) =>
  SVG_CIRCUMFERENCE * (1 - pct / 100);

const formatGrade = (avgProgress: number) =>
  (avgProgress / 10).toFixed(1);

const getPerformanceLabel = (avgProgress: number) => {
  if (avgProgress >= 80) return "Excellent!";
  if (avgProgress >= 60) return "Good";
  if (avgProgress >= 40) return "Needs Improvement";
  return "Just Starting";
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function StudentDashboard({
  userId,
  userName,
  userEmail,
  userRole,
  twoFactorEnabled,
  enrolledCourses = [],
  weeklyHours = [0, 0, 0, 0, 0],
  avgProgress = 0,
}: StudentDashboardProps) {
  const router = useRouter();
  const today = new Date();

  // ── Calendar ───────────────────────────────────────────────────────────────
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const calLabel = new Date(calYear, calMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const isCurrentMonth =
    calYear === today.getFullYear() && calMonth === today.getMonth();

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  };

  // ── Todo (localStorage) ───────────────────────────────────────────────────
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [todosReady, setTodosReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(getTodoKey(userId));
      if (raw) setTodos(JSON.parse(raw));
    } catch { /* localStorage unavailable */ }
    setTodosReady(true);
  }, [userId]);

  useEffect(() => {
    if (!todosReady) return;
    try {
      localStorage.setItem(getTodoKey(userId), JSON.stringify(todos));
    } catch { /* quota exceeded */ }
  }, [todos, userId, todosReady]);

  const toggleTodo = useCallback(
    (id: number) =>
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))),
    []
  );

  const deleteTodo = useCallback(
    (id: number) => setTodos((prev) => prev.filter((t) => t.id !== id)),
    []
  );

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTask.trim();
    if (!trimmed) return;
    const entry: Todo = {
      id: Date.now(),
      task: trimmed,
      date: `Today, ${today.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
      })}`,
      done: false,
    };
    setTodos((prev) => [entry, ...prev]);
    setNewTask("");
  };

  // ── Hours chart (normalize to % height for rendering) ─────────────────────
  const maxHours = Math.max(...weeklyHours, 0.1);
  const hoursBars = weeklyHours.map((h) => Math.max((h / maxHours) * 95, 2));
  const hasStudyActivity = weeklyHours.some((h) => h > 0);

  // ── Upcoming lesson: first course not yet 100% complete ───────────────────
  const upcomingCourse = enrolledCourses.find((c) => c.progress < 100) ?? null;

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hello {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Let&apos;s learn something new today!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{userName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {userRole}
            </p>
          </div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden shadow-sm ring-2 ring-white">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                userName
              )}`}
              alt="Profile avatar"
            />
          </div>
        </div>
      </header>

      {/* ── 2FA Alert Banner ── */}
      {!twoFactorEnabled && (
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-[#FF6B4A] p-6 rounded-[2rem] text-white shadow-xl shadow-orange-200/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Amankan Akun Kamu! 🛡️
              </h2>
              <p className="text-white/80 text-sm max-w-md mt-0.5 font-medium leading-relaxed">
                Aktifkan Autentikasi Dua Faktor (2FA) sekarang untuk melindungi
                data belajar dan akses akunmu dari peretasan.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/settings/security")}
            className="bg-white text-[#FF6B4A] hover:bg-slate-50 font-black px-8 py-6 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/5 shrink-0 z-10"
          >
            Aktifkan Sekarang →
          </Button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[60px] opacity-50" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Study Hours Chart */}
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Weekly Study Hours
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    Last 5 days activity
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Study
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between h-36 gap-3 px-2">
                {hoursBars.map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2 h-full"
                  >
                    <div className="w-full h-full flex flex-col justify-end">
                      <div
                        className="w-full bg-[#FF6B4A] rounded-sm hover:bg-[#fa5a36] transition-colors"
                        style={{ height: `${height}%` }}
                        title={`${weeklyHours[i].toFixed(1)}h`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">
                      {DAY_LABELS[i]}
                    </span>
                  </div>
                ))}
              </div>

              {!hasStudyActivity && (
                <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
                  No study activity in the last 5 days
                </p>
              )}
            </div>

            {/* Performance — real avg progress */}
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center">
              <div className="w-full flex justify-between items-start mb-2">
                <h3 className="text-sm font-bold text-slate-800">
                  Performance
                </h3>
                <MoreVertical size={14} className="text-slate-300" />
              </div>

              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
                  <circle
                    cx="64" cy="64" r="54"
                    stroke="currentColor" strokeWidth="10" fill="transparent"
                    className="text-slate-50"
                  />
                  <circle
                    cx="64" cy="64" r="54"
                    stroke="currentColor" strokeWidth="10" fill="transparent"
                    strokeDasharray={SVG_CIRCUMFERENCE}
                    strokeDashoffset={calcSvgOffset(avgProgress)}
                    className="text-[#FF6B4A] transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-800">
                    {formatGrade(avgProgress)}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    Grade
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 text-center font-medium">
                Your performance is{" "}
                <span className="text-[#FF6B4A] font-bold">
                  {getPerformanceLabel(avgProgress)}
                </span>
              </p>
            </div>
          </div>

          {/* ── Enrolled Courses ── */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 px-2">
              Recent enrolled classes
            </h3>
            <div className="space-y-3">
              {enrolledCourses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 text-sm">
                  Belum ada kelas yang didaftarkan.
                </div>
              ) : (
                enrolledCourses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border transition-all ${
                      cls.active
                        ? "bg-white border-orange-100 shadow-md"
                        : "bg-transparent border-transparent hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          cls.active
                            ? "bg-orange-50 text-[#FF6B4A]"
                            : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        <Play
                          size={20}
                          fill={cls.active ? "currentColor" : "none"}
                        />
                      </div>
                      <div className="min-w-[180px]">
                        <p className="font-bold text-slate-800 text-[15px]">
                          {cls.title}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {cls.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={12} /> {cls.lessons}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                        <span>Progress</span>
                        <span className={cls.active ? "text-[#FF6B4A]" : ""}>
                          {cls.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${
                            cls.active ? "bg-[#FF6B4A]" : "bg-slate-300"
                          }`}
                          style={{ width: `${cls.progress}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        router.push(`/courses/${cls.slug}/learn`)
                      }
                      variant={cls.active ? "default" : "outline"}
                      className={`rounded-xl h-10 px-6 font-bold text-xs ${
                        cls.active
                          ? "bg-[#FF6B4A] hover:bg-[#fa5a36] shadow-lg shadow-orange-200"
                          : "border-slate-200 text-slate-400"
                      }`}
                    >
                      {cls.active ? "Continue" : "Completed"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-8">
          {/* Dynamic Calendar */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                {calLabel}
              </h3>
              <div className="flex gap-1 text-slate-300">
                <button
                  onClick={prevMonth}
                  aria-label="Previous month"
                  className="hover:text-[#FF6B4A] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextMonth}
                  aria-label="Next month"
                  className="hover:text-[#FF6B4A] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-[10px] font-bold text-slate-300">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Leading empty cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = isCurrentMonth && day === today.getDate();
                return (
                  <span
                    key={day}
                    className={`text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer ${
                      isToday
                        ? "bg-[#FF6B4A] text-white shadow-md shadow-orange-100"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Todo List (localStorage) */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50">
            <h3 className="text-sm font-bold text-slate-800 mb-6">
              To Do List
            </h3>

            <form onSubmit={addTodo} className="mb-6 flex gap-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                type="text"
                placeholder="Add new task..."
                className="flex-1 bg-[#F8F9FB] border-none rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-orange-200 transition-all"
              />
              <button
                type="submit"
                aria-label="Add task"
                className="p-2 bg-[#FF6B4A] text-white rounded-xl hover:bg-[#fa5a36] transition-colors"
              >
                <Plus size={16} />
              </button>
            </form>

            {!todosReady ? (
              <p className="text-center text-xs text-slate-300 py-4">
                Loading...
              </p>
            ) : todos.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4 font-medium">
                No tasks yet. Add one above!
              </p>
            ) : (
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {todos.map((item) => (
                  <div key={item.id} className="flex gap-3 group">
                    <button
                      onClick={() => toggleTodo(item.id)}
                      aria-label={item.done ? "Mark incomplete" : "Mark complete"}
                      className={`flex-shrink-0 w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center transition-all ${
                        item.done
                          ? "bg-[#FF6B4A] border-[#FF6B4A]"
                          : "border-slate-200 hover:border-orange-300"
                      }`}
                    >
                      {item.done && (
                        <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />
                      )}
                    </button>

                    <div className="flex-1 border-b border-slate-50 pb-3">
                      <p
                        className={`text-[13px] font-bold transition-all ${
                          item.done
                            ? "text-slate-300 line-through"
                            : "text-slate-700"
                        }`}
                      >
                        {item.task}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {item.date}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteTodo(item.id)}
                      aria-label="Delete task"
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Lesson */}
          <div className="bg-[#100E2E] p-6 rounded-[2rem] text-white relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 text-[#FF6B4A]">
                <Video size={20} />
              </div>
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                Next Up
              </h4>
              {upcomingCourse ? (
                <>
                  <p className="text-[15px] font-bold leading-snug">
                    {upcomingCourse.title}
                  </p>
                  <p className="text-[10px] text-white/30 mb-6 font-medium mt-1">
                    {upcomingCourse.progress}% completed · {upcomingCourse.lessons}
                  </p>
                  <Button
                    onClick={() =>
                      router.push(`/courses/${upcomingCourse.slug}/learn`)
                    }
                    className="w-full bg-[#FF6B4A] hover:bg-[#fa5a36] text-white rounded-xl font-bold h-11 text-xs shadow-lg shadow-orange-900/20"
                  >
                    Continue Learning
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-bold leading-snug">
                    All caught up! 🎉
                  </p>
                  <p className="text-[10px] text-white/30 mb-6 font-medium mt-1">
                    Explore new courses to keep growing
                  </p>
                  <Button
                    onClick={() => router.push("/courses")}
                    className="w-full bg-[#FF6B4A] hover:bg-[#fa5a36] text-white rounded-xl font-bold h-11 text-xs shadow-lg shadow-orange-900/20"
                  >
                    Browse Courses
                  </Button>
                </>
              )}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B4A]/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-[#FF6B4A]/20 transition-all duration-700" />
          </div>
        </div>
      </div>
    </main>
  );
}

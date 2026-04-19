"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  BookOpen,
  Video,
  Settings,
  LogOut,
  Search,
  Bell,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  Download,
  Play,
  MoreVertical,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Tipe data
interface Todo {
  id: number;
  task: string;
  date: string;
  done: boolean;
}

interface Course {
  id: number;
  title: string;
  time: string;
  lessons: string;
  progress: number;
  active: boolean;
}

interface StudentDashboardProps {
  userName: string;
  userEmail: string;
  twoFactorEnabled?: boolean;
}

export default function StudentDashboard({ userName, userEmail, twoFactorEnabled }: StudentDashboardProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };
  // --- STATE MANAGEMENT ---
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      task: "Human Interaction Designs",
      date: "Tuesday, 30 June 2024",
      done: false,
    },
    {
      id: 2,
      task: "Design system Basics",
      date: "Monday, 24 June 2024",
      done: false,
    },
    {
      id: 3,
      task: "Introduction to UI",
      date: "Friday, 10 June 2024",
      done: true,
    },
    {
      id: 4,
      task: "Basics of Figma",
      date: "Friday, 05 June 2024",
      done: true,
    },
  ]);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "User Experience (UX) Design",
      time: "5:30hrs",
      lessons: "05/10 Lessons",
      progress: 75,
      active: true,
    },
    {
      id: 2,
      title: "Visual Design and Branding",
      time: "4:00hrs",
      lessons: "03/12 Lessons",
      progress: 25,
      active: false,
    },
  ]);

  const [newTask, setNewTask] = useState("");

  // Fungsi Toggle Status Todo
  const toggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  // Fungsi Tambah Todo
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const newEntry: Todo = {
      id: Date.now(),
      task: newTask,
      date:
        "Today, " +
        new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
        }),
      done: false,
    };

    setTodos([newEntry, ...todos]);
    setNewTask("");
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-[#1E1E1E]">
      {/* --- SIDEBAR --- */}
      <aside className="w-[260px] bg-white border-r border-slate-100 hidden xl:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF6B4A] rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            Learnify
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { name: "Dashboard", id: "dashboard", icon: <LayoutDashboard size={18} /> },
            { name: "Assignments", id: "assignments", icon: <FileText size={18} /> },
            { name: "Schedule", id: "schedule", icon: <Calendar size={18} /> },
            { name: "Recordings", id: "recordings", icon: <Video size={18} /> },
            { name: "Resources", id: "resources", icon: <Download size={18} /> },
            { name: "Settings", id: "settings", icon: <Settings size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "settings") {
                  router.push("/dashboard/settings/security");
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${
                item.id === "dashboard"
                  ? "bg-[#FF6B4A] text-white shadow-md shadow-orange-100"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 font-semibold text-[14px] hover:text-red-500 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Hello {userName.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm">
              Let&apos;s learn something new today!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                size={16}
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-11 pr-4 h-11 bg-white rounded-xl border-none shadow-sm w-64 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
              />
            </div>
            <button className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400 hover:text-[#FF6B4A] transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{userName}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {userEmail}
                </p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-xl overflow-hidden shadow-sm ring-2 ring-white">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`}
                  alt="profile"
                />
              </div>
            </div>
          </div>
        </header>

        {/* --- 2FA ALERT BANNER --- */}
        {!twoFactorEnabled && (
          <div className="mb-8 bg-gradient-to-r from-orange-500 to-[#FF6B4A] p-6 rounded-[2rem] text-white shadow-xl shadow-orange-200/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="flex items-center gap-5 z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Amankan Akun Kamu! 🛡️</h2>
                <p className="text-white/80 text-sm max-w-md mt-0.5 font-medium leading-relaxed">
                  Aktifkan Autentikasi Dua Faktor (2FA) sekarang untuk melindungi data belajar dan akses akunmu dari peretasan.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => router.push("/dashboard/settings/security")}
              className="bg-white text-[#FF6B4A] hover:bg-slate-50 font-black px-8 py-6 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/5 shrink-0 z-10"
            >
              Aktifkan Sekarang →
            </Button>
            
            {/* Dekorasi Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-white/20" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[60px] opacity-50" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hours Spent Graph */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-bold text-slate-800">
                    Hours Spent
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        Study
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-orange-100" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        Test
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between h-40 gap-3 px-2">
                  {[45, 75, 50, 95, 65].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-3 h-full"
                    >
                      <div className="w-full h-full flex flex-col justify-end gap-1 group relative">
                        <div
                          className="w-full bg-orange-100 rounded-sm group-hover:bg-orange-200 transition-colors"
                          style={{ height: `${h / 2.5}%` }}
                        />
                        <div
                          className="w-full bg-[#FF6B4A] rounded-sm group-hover:bg-[#fa5a36] transition-colors"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300 uppercase">
                        Month
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Grade */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center">
                <div className="w-full flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    Performance
                  </h3>
                  <MoreVertical size={14} className="text-slate-300" />
                </div>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      className="text-slate-50"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="339.29"
                      strokeDashoffset="80"
                      className="text-[#FF6B4A] transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-800">
                      8.966
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Grade
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4 text-center font-medium">
                  Your performance is{" "}
                  <span className="text-[#FF6B4A] font-bold">Excellent!</span>
                </p>
              </div>
            </div>

            {/* --- RECENT ENROLLED CLASSES WITH PROGRESS --- */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 px-2">
                Recent enrolled classes
              </h3>
              <div className="space-y-3">
                {courses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border transition-all ${cls.active ? "bg-white border-orange-100 shadow-md" : "bg-transparent border-transparent hover:bg-white"}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls.active ? "bg-orange-50 text-[#FF6B4A]" : "bg-slate-50 text-slate-400"}`}
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

                    {/* Progress Bar Section */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                        <span>Progress</span>
                        <span className={cls.active ? "text-[#FF6B4A]" : ""}>
                          {cls.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${cls.active ? "bg-[#FF6B4A]" : "bg-slate-300"}`}
                          style={{ width: `${cls.progress}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      variant={cls.active ? "default" : "outline"}
                      className={`rounded-xl h-10 px-6 font-bold text-xs ${cls.active ? "bg-[#FF6B4A] hover:bg-[#fa5a36] shadow-lg shadow-orange-200" : "border-slate-200 text-slate-400"}`}
                    >
                      {cls.active ? "Continue" : "View"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  June 2024
                </h3>
                <div className="flex gap-1 text-slate-300">
                  <ChevronRight
                    size={16}
                    className="rotate-180 cursor-pointer"
                  />
                  <ChevronRight size={16} className="cursor-pointer" />
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2 text-[10px] font-bold text-slate-300">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span> 
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {[...Array(30)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-[11px] font-bold py-2 rounded-xl transition-all cursor-pointer ${i + 1 === 10 ? "bg-[#FF6B4A] text-white shadow-md shadow-orange-100" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-50">
              <h3 className="text-sm font-bold text-slate-800 mb-6">
                To do List
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
                  className="p-2 bg-[#FF6B4A] text-white rounded-xl hover:bg-[#fa5a36] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </form>
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {todos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleTodo(item.id)}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center transition-all ${item.done ? "bg-[#FF6B4A] border-[#FF6B4A]" : "border-slate-200 group-hover:border-orange-300"}`}
                    >
                      {item.done && (
                        <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-1" />
                      )}
                    </div>
                    <div className="flex-1 border-b border-slate-50 pb-3 group-last:border-none">
                      <p
                        className={`text-[13px] font-bold transition-all ${item.done ? "text-slate-300 line-through" : "text-slate-700"}`}
                      >
                        {item.task}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#100E2E] p-6 rounded-[2rem] text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 text-[#FF6B4A]">
                  <Video size={20} />
                </div>
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">
                  Upcoming Lesson
                </h4>
                <p className="text-[15px] font-bold">UX Design Fundamentals</p>
                <p className="text-[10px] text-white/30 mb-6 font-medium">
                  Today, 5:30pm
                </p>
                <Button className="w-full bg-[#FF6B4A] hover:bg-[#fa5a36] text-white rounded-xl font-bold h-11 text-xs shadow-lg shadow-orange-900/20">
                  Join Class
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B4A]/10 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-[#FF6B4A]/20 transition-all duration-700" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

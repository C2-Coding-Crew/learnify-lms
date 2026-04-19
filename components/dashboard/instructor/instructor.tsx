"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  Video,
  Settings,
  LogOut,
  Plus,
  BookOpenCheck,
  TrendingUp,
  MoreVertical,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PendingGrading {
  id: number;
  studentName: string;
  assignment: string;
  dueDate: string;
}

interface ManagedCourse {
  id: number;
  title: string;
  students: number;
  rating: number;
  revenue: string;
  active: boolean;
}

interface InstructorDashboardProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function InstructorDashboard({
  userName,
  userEmail,
  userRole,
}: InstructorDashboardProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const [gradings] = useState<PendingGrading[]>([
    {
      id: 1,
      studentName: "Aditya Pratama",
      assignment: "UI Case Study",
      dueDate: "Today",
    },
    {
      id: 2,
      studentName: "Siti Aminah",
      assignment: "Figma Component Lab",
      dueDate: "Yesterday",
    },
    {
      id: 3,
      studentName: "Budi Santoso",
      assignment: "Wireframing Basics",
      dueDate: "2 days ago",
    },
  ]);

  const [managedCourses] = useState<ManagedCourse[]>([
    {
      id: 1,
      title: "Mastering React for Beginners",
      students: 1250,
      rating: 4.8,
      revenue: "Rp 12.500.000",
      active: true,
    },
    {
      id: 2,
      title: "Advanced UI/UX Design System",
      students: 850,
      rating: 4.9,
      revenue: "Rp 8.200.000",
      active: false,
    },
  ]);

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-[#1E1E1E]">
      {/* --- SIDEBAR --- */}
      <aside className="w-[260px] bg-white border-r border-slate-100 hidden xl:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF6B4A] rounded-lg flex items-center justify-center shadow-lg shadow-orange-200">
            <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-800">
            Learnify.{" "}
            <span className="text-[10px] bg-orange-50 text-[#FF6B4A] px-2 py-0.5 rounded-full ml-1 font-bold">
              PRO
            </span>
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { name: "Dashboard", icon: LayoutDashboard },
            { name: "My Courses", icon: BookOpenCheck },
            { name: "Students", icon: Users },
            { name: "Assignments", icon: FileText },
            { name: "Earnings", icon: TrendingUp },
            { name: "Live Sessions", icon: Video },
            { name: "Messages", icon: MessageSquare },
            { name: "Settings", icon: Settings },
          ].map((item, idx) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all duration-200 ${
                idx === 0
                  ? "bg-[#FF6B4A] text-white shadow-lg shadow-orange-100"
                  : "text-slate-400 hover:bg-orange-50 hover:text-[#FF6B4A]"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 font-bold text-[14px] hover:text-red-500 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Instructor Hub: {userName.split(" ")[0]} ✍️
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              You have {gradings.length} assignments pending to grade.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-xl flex gap-2 items-center px-5 h-11 text-sm font-black shadow-lg shadow-orange-100 transition-all hover:-translate-y-1">
              <Plus size={18} /> Create New Course
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800">{userName}</p>
                <p className="text-[10px] text-[#FF6B4A] font-black uppercase tracking-wider">
                  {userRole}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-xl overflow-hidden shadow-sm ring-2 ring-white">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`}
                  alt="profile"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Revenue Stat */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Monthly Earnings
                  </h3>
                  <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-md">
                    +12.5%
                  </span>
                </div>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[30, 45, 35, 60, 80, 55, 90].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-orange-50 rounded-lg relative group overflow-hidden h-full flex flex-col justify-end"
                    >
                      <div
                        className="w-full bg-[#FF6B4A] rounded-lg transition-all duration-500 group-hover:bg-[#100E2E]"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-2xl font-black text-slate-800 tracking-tighter">
                  Rp 24.850.000
                </p>
              </div>

              {/* Course Engagement */}
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center">
                <div className="w-full flex justify-between items-start mb-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Avg. Course Rating
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
                      stroke="#FF6B4A"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="339.29"
                      strokeDashoffset="40"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-slate-800">
                      4.89
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">
                      Stars
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-[#FF6B4A] mt-4 text-center bg-orange-50 px-3 py-1 rounded-full">
                  Top 1% of Instructors
                </p>
              </div>
            </div>

            {/* Managed Courses */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-800 px-2 text-sm uppercase tracking-widest">
                Active Courses Performance
              </h3>
              <div className="space-y-3">
                {managedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-5 bg-white rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B4A] flex items-center justify-center">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-[15px]">
                          {course.title}
                        </p>
                        <p
                          className="text-[11px] text-slate-400 font-bold"
                          suppressHydrationWarning
                        >
                          {course.students.toLocaleString()} Students Enrolled
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Revenue
                      </p>
                      <p className="text-sm font-black text-[#100E2E]">
                        {course.revenue}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-xl h-10 px-6 font-black text-xs border-slate-200 text-slate-600 hover:bg-[#FF6B4A] hover:text-white hover:border-[#FF6B4A] transition-all"
                    >
                      Manage
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Grading Tasks */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                Pending Grading
              </h3>
              <div className="space-y-4">
                {gradings.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 pb-3 border-b border-slate-50 last:border-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-[#FF6B4A]">
                      {item.studentName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-black text-slate-700">
                        {item.studentName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item.assignment}
                      </p>
                    </div>
                    <span className="text-[9px] font-black px-2 py-1 bg-orange-50 text-[#FF6B4A] rounded-md">
                      {item.dueDate}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-orange-50 hover:bg-[#FF6B4A] hover:text-white text-[#FF6B4A] text-xs font-black rounded-xl h-11 transition-all">
                Review All Submissions
              </Button>
            </div>

            {/* Next Live Class Promo */}
            <div className="bg-[#100E2E] p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#FF6B4A] rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Video size={20} />
                </div>
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                  Upcoming Live Stream
                </h4>
                <p className="text-lg font-black leading-tight mb-1">
                  Q&A Session: React Hooks
                </p>
                <p className="text-[10px] text-[#FF6B4A] mb-8 font-black uppercase tracking-widest">
                  Starting in 45 minutes
                </p>
                <Button className="w-full bg-white hover:bg-orange-50 text-[#100E2E] rounded-xl font-black h-12 text-xs transition-all shadow-xl">
                  Go to Studio
                </Button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B4A]/10 rounded-full blur-[60px] -mr-16 -mt-16" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Video,
  Settings,
  LogOut,
  BookOpenCheck,
  TrendingUp,
  MessageSquare,
  FileText,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstructorSidebarProps {
  userName: string;
}

const NAV_ITEMS = [
  { name: "Dashboard",      href: "/dashboard/instructor",              icon: LayoutDashboard },
  { name: "My Courses",     href: "/dashboard/instructor/courses",      icon: BookOpenCheck },
  { name: "Students",       href: "/dashboard/instructor/students",     icon: Users },
  { name: "Assignments",    href: "/dashboard/instructor/assignments",   icon: FileText },
  { name: "Earnings",       href: "/dashboard/instructor/earnings",     icon: TrendingUp },
  { name: "Live Sessions",  href: "/dashboard/instructor/live",         icon: Video },
  { name: "Messages",       href: "/dashboard/instructor/messages",     icon: MessageSquare },
  { name: "Settings",       href: "/dashboard/settings/security",       icon: Settings },
] as const;

export default function InstructorSidebar({ userName }: InstructorSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = "/api/auth/sign-out";
  };

  return (
    <aside className="w-[260px] bg-white border-r border-slate-100 hidden xl:flex flex-col sticky top-0 h-screen">
      {/* Logo */}
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

      {/* Primary CTA — Create New Course */}
      <div className="px-6 mb-4">
        <Button
          onClick={() => router.push("/dashboard/instructor/courses/new")}
          className="w-full bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-xl flex gap-2 items-center justify-center h-11 text-sm font-black shadow-lg shadow-orange-100 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Create New Course
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-all duration-200 ${
                isActive
                  ? "bg-[#FF6B4A] text-white shadow-lg shadow-orange-100"
                  : "text-slate-400 hover:bg-orange-50 hover:text-[#FF6B4A]"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile + Logout */}
      <div className="p-4 mx-4 mb-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-100 shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                userName
              )}`}
              alt="Instructor avatar"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black text-slate-800 truncate">{userName}</p>
            <p className="text-[10px] text-[#FF6B4A] font-bold uppercase tracking-wider">
              Instructor
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-400 hover:text-red-500 border border-slate-100 rounded-xl font-bold text-xs transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

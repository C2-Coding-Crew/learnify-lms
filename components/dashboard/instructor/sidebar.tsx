"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
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
} from "lucide-react";

export default function InstructorSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = "/api/auth/sign-out";
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard/instructor", icon: LayoutDashboard },
    { name: "My Courses", href: "/dashboard/instructor/courses", icon: BookOpenCheck },
    { name: "Students", href: "/dashboard/instructor/students", icon: Users },
    { name: "Assignments", href: "/dashboard/instructor/assignments", icon: FileText },
    { name: "Earnings", href: "/dashboard/instructor/earnings", icon: TrendingUp },
    { name: "Live Sessions", href: "/dashboard/instructor/live", icon: Video },
    { name: "Messages", href: "/dashboard/instructor/messages", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings/security", icon: Settings },
  ];

  return (
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
        {navItems.map((item) => {
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

      <div className="p-6 border-t border-slate-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 font-bold text-[14px] hover:text-red-500 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}

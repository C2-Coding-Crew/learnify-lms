"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Video,
  Download,
  Settings,
  LogOut,
} from "lucide-react";

interface StudentSidebarProps {
  userName: string;
  activePath?: string;
}

export default function StudentSidebar({ userName, activePath }: StudentSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const active = activePath ?? pathname;

  const handleLogout = () => {
    window.location.href = "/api/auth/sign-out";
  };

  const navItems = [
    { name: "Dashboard",   href: "/dashboard/student",              icon: LayoutDashboard },
    { name: "Assignments", href: "/dashboard/student/assignments",   icon: FileText },
    { name: "Schedule",    href: "/dashboard/student/schedule",      icon: Calendar },
    { name: "Recordings",  href: "/dashboard/student/recordings",    icon: Video },
    { name: "Resources",   href: "/dashboard/student/resources",     icon: Download },
    { name: "Settings",    href: "/dashboard/settings/security",     icon: Settings },
  ];

  return (
    <aside className="w-[260px] bg-white border-r border-slate-100 hidden xl:flex flex-col sticky top-0 h-screen">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#FF6B4A] rounded-lg flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm rotate-45" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">Learnify</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${
                isActive
                  ? "bg-[#FF6B4A] text-white shadow-md shadow-orange-100"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mx-4 mb-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-100">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`}
              alt="avatar"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
            <p className="text-[10px] text-[#FF6B4A] font-bold uppercase tracking-wider">Student</p>
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

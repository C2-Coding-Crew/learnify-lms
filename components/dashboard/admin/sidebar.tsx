"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  Wallet,
  Activity,
  QrCode,
  ShieldCheck,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  userName: string;
  onEnable2FA?: () => void;
}

export default function AdminSidebar({ userName, onEnable2FA }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = "/api/auth/sign-out";
  };

  const navItems = [
    { name: "Main Console",        href: "/dashboard/admin",                   icon: LayoutDashboard },
    { name: "Manage Students",     href: "/dashboard/admin/students",           icon: GraduationCap },
    { name: "Manage Instructors",  href: "/dashboard/admin/instructors",        icon: UserCheck },
    { name: "Course Revenues",     href: "/dashboard/admin/revenues",           icon: Wallet },
    { name: "System Logs",         href: "/dashboard/admin/logs",               icon: Activity },
  ];

  return (
    <aside className="w-[280px] bg-white hidden xl:flex flex-col sticky top-0 h-screen border-r border-orange-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tighter block text-[#2D2D2D]">Learnify.</span>
          <span className="text-[10px] font-bold text-orange-600 tracking-[1.5px] uppercase leading-none">Super Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-6 space-y-1">
        <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4 mt-4">Monitoring System</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-[14px] transition-all ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-400 hover:bg-orange-50/50 hover:text-orange-600"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-orange-600" : "text-slate-300"} />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-slate-50 mt-4">
          {onEnable2FA && (
            <button
              onClick={onEnable2FA}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-[14px] text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all"
            >
              <QrCode size={20} className="text-slate-300" />
              2FA Security
            </button>
          )}
        </div>
      </nav>

      <div className="p-6 m-4 bg-orange-50/50 rounded-[2rem] border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-orange-600 shadow-sm border border-orange-100">
            {userName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-[#2D2D2D] truncate">{userName}</p>
            <p className="text-[10px] text-orange-500 font-bold truncate italic uppercase tracking-tighter">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-orange-100 rounded-xl font-black text-[12px] transition-all shadow-sm"
        >
          <LogOut size={16} /> Sign Out Panel
        </button>
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  Wallet,
  Activity,
  QrCode,
  ShieldCheck,
  LogOut,
  Tags,
  Banknote,
  Tag,
  Medal,
} from "lucide-react";

interface AdminSidebarProps {
  userName: string;
  pendingCount?: number;
  pendingPayoutCount?: number;
  onEnable2FA?: () => void;
}

const NAV_ITEMS = [
  {
    name: "Main Console",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Course Approvals",
    href: "/dashboard/admin/courses/approvals",
    icon: ShieldCheck,
    badge: "pending", // key to inject pendingCount
  },
  {
    name: "Manage Students",
    href: "/dashboard/admin/students",
    icon: GraduationCap,
    badge: null,
  },
  {
    name: "Manage Instructors",
    href: "/dashboard/admin/instructors",
    icon: UserCheck,
    badge: null,
  },
  {
    name: "Course Revenues",
    href: "/dashboard/admin/revenues",
    icon: Wallet,
    badge: null,
  },
  {
    name: "System Activity",
    href: "/dashboard/admin/logs",
    icon: Activity,
    badge: null,
  },
  {
    name: "Master Categories",
    href: "/dashboard/admin/categories",
    icon: Tags,
    badge: null,
  },
  {
    name: "Payout Moderation",
    href: "/dashboard/admin/payouts",
    icon: Banknote,
    badge: "payout",
  },
  {
    name: "Manage Coupons",
    href: "/dashboard/admin/coupons",
    icon: Tag,
    badge: null,
  },
  {
    name: "System Badges",
    href: "/dashboard/admin/badges",
    icon: Medal,
    badge: null,
  },
] as const;

export default function AdminSidebar({
  userName,
  pendingCount = 0,
  pendingPayoutCount = 0,
  onEnable2FA,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    window.location.href = "/api/auth/sign-out";
  };

  return (
    <aside className="w-[280px] bg-white hidden xl:flex flex-col sticky top-0 h-screen border-r border-orange-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div>
          <span className="text-xl font-black tracking-tighter block text-[#2D2D2D]">
            Learnify.
          </span>
          <span className="text-[10px] font-bold text-orange-600 tracking-[1.5px] uppercase leading-none">
            Super Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 space-y-0.5 overflow-y-auto">
        <p className="px-4 text-[9px] font-black text-slate-300 uppercase tracking-[2px] mb-2 mt-2">
          Monitoring System
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          
          let count = 0;
          if (item.badge === "pending") count = pendingCount;
          if (item.badge === "payout") count = pendingPayoutCount;
          
          const showBadge = count > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-slate-400 hover:bg-orange-50/50 hover:text-orange-600"
              }`}
            >
              <item.icon
                size={20}
                className={isActive ? "text-orange-600" : "text-slate-300"}
              />
              <span className="flex-1">{item.name}</span>
              {showBadge && (
                <span className="min-w-[22px] h-[22px] bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-orange-200 animate-pulse">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}

        {/* 2FA Button */}
        {onEnable2FA && (
          <div className="pt-2 border-t border-slate-50 mt-2">
            <button
              onClick={onEnable2FA}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all"
            >
              <QrCode size={20} className="text-slate-300" />
              2FA Security
            </button>
          </div>
        )}
      </nav>

      {/* User Card */}
      <div className="p-4 m-3 bg-orange-50/50 rounded-[1.5rem] border border-orange-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-black text-orange-600 shadow-sm border border-orange-100 text-[10px]">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-black text-[#2D2D2D] truncate">{userName}</p>
            <p className="text-[9px] text-orange-500 font-bold truncate italic uppercase tracking-tighter">
              Administrator
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-orange-100 rounded-lg font-black text-[11px] transition-all shadow-sm"
        >
          <LogOut size={16} /> Sign Out Panel
        </button>
      </div>
    </aside>
  );
}

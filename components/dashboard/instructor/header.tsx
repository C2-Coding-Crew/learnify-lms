"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InstructorHeaderProps {
  userName: string;
  userRole: string;
  title: string;
  subtitle: string;
  actionButton?: boolean;
}

export default function InstructorHeader({ userName, userRole, title, subtitle, actionButton = false }: InstructorHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {actionButton && (
          <Link href="/dashboard/instructor/courses/create">
            <Button className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-xl flex gap-2 items-center px-5 h-11 text-sm font-black shadow-lg shadow-orange-100 transition-all hover:-translate-y-1">
              <Plus size={18} /> Create New Course
            </Button>
          </Link>
        )}
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
  );
}

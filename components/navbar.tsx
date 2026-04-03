"use client";

import React from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-50">
      <div className="h-[80px] px-6 md:px-12 flex items-center justify-between max-w-[1440px] mx-auto">
        <div className="flex items-center gap-10">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#FF6B4A] to-[#ff8e75] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 transition-transform group-hover:rotate-12">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Learnify<span className="text-[#FF6B4A]">.</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden xl:flex items-center gap-8 text-[14px] font-semibold text-slate-600">
            <Link
              href="/"
              className="hover:text-[#FF6B4A] transition-colors"
            >
              Home
              <span className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/courses"
              className="hover:text-[#FF6B4A] transition-colors"
            >
              Kursus
              <span className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link
              href="/about"
              className="hover:text-[#FF6B4A] transition-colors"
            >
              Tentang Kami
            </Link>

            <Link
              href="/contact"
              className="hover:text-[#FF6B4A] transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Search Icon */}
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors hidden md:block">
            <Search className="h-5 w-5" />
          </button>

          {/* Shopping Cart */}
          <div className="relative group cursor-pointer p-2">
            <ShoppingCart className="h-5 w-5 text-slate-400 group-hover:text-[#FF6B4A] transition-colors" />
            <span className="absolute top-0 right-0 bg-[#FF6B4A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              0
            </span>
          </div>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

          {/* AUTH SECTION */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-6 py-2 text-[14px] font-bold text-slate-600 border border-slate-200 rounded-full hover:text-[#FF6B4A] hover:border-[#FF6B4A] hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-orange-100"
            >
              Masuk
            </Link>

            <Link
              href="/auth/register"
              className="px-6 py-2 text-[14px] font-bold text-slate-600 border border-slate-200 rounded-full hover:text-[#FF6B4A] hover:border-[#FF6B4A] hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-orange-100"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <>
      {/* --- SUBSCRIBE SECTION --- */}
      <section className="pb-24 px-6 md:px-12 bg-white">
        <div className="max-w-[1440px] mx-auto bg-[#0F172A] rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center">
          <div className="absolute top-10 left-10 md:left-20 w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden hidden sm:block">
            <img src="https://i.pravatar.cc/150?u=1" alt="student" />
          </div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Dapatkan info kursus baru <br /> langsung di inbox Anda
            </h2>

            <p className="text-slate-400">
              Jadilah yang pertama tahu saat kelas favorit Anda dibuka.
              Bergabunglah dengan 20rb+ pembelajar aktif lainnya.
            </p>

            <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
              <input
                type="email"
                placeholder="Ketik email aktif Anda..."
                className="flex-1 bg-transparent px-6 py-4 outline-none text-white placeholder-slate-500"
              />
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white h-14 px-10 rounded-xl font-bold transition-all">
                Ikuti Update
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN FOOTER --- */}
      <footer className="py-20 px-6 md:px-12 bg-white border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="space-y-6 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF6B4A] rounded-lg flex items-center justify-center shadow-md shadow-orange-100">
                  <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-800">
                  Learnify
                </span>
              </Link>

              <div className="space-y-2 pt-4">
                <p className="text-sm text-slate-400">
                  ©2026 Learnify Indonesia
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dibangun dengan semangat <br /> mencerdaskan bangsa.
                </p>
              </div>
            </div>

            {/* Links Columns */}
            {[
              {
                title: "Belajar",
                links: ["Kelas Intensif", "Workshop Virtual", "Materi Mandiri", "Video On-Demand", "Pelatihan Luring"],
              },
              {
                title: "Jejaring",
                links: ["Alumni", "Partner Strategis", "Kontributor", "Riwayat", "Jurnal", "Portal Mentor"],
              },
              {
                title: "Navigasi",
                links: ["Beranda", "Edu-Professional", "Daftar Kursus", "Informasi Pendaftaran", "Ulasan Siswa", "Program Khusus"],
              },
              {
                title: "Legalitas",
                links: ["Kabar Terbaru", "Investor", "Syarat & Ketentuan", "Kebijakan Privasi", "Pusat Bantuan", "Hubungi Kami"],
              },
            ].map((column, idx) => (
              <div key={idx} className="space-y-6">
                <h4 className="text-lg font-bold text-slate-800">
                  {column.title}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <Link
                        href="#"
                        className="text-slate-500 hover:text-[#FF6B4A] text-sm transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
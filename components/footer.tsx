"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <>
      {/* --- SUBSCRIBE SECTION --- */}
      <section className="py-10 px-6 bg-white">
        <div className="max-w-6xl mx-auto bg-[#100E2E] rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden">
          {/* Dekorasi Aksen */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B4A]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-2 text-left">
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                Dapatkan info kursus baru <br /> 
                <span className="text-[#FF6B4A]">langsung di inbox Anda</span>
              </h2>
              <p className="text-slate-400 text-xs md:text-sm">
                Bergabunglah dengan 20rb+ pembelajar aktif lainnya.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 bg-white/5 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <input
                type="email"
                placeholder="Email aktif Anda..."
                className="flex-1 bg-transparent px-4 py-2.5 outline-none text-white text-sm placeholder-slate-500"
              />
              <Button className="bg-[#FF6B4A] hover:bg-[#fa5a36] text-white h-11 px-6 rounded-lg font-bold text-sm transition-all shadow-lg">
                Ikuti Update
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN FOOTER --- */}
      <footer className="pb-8 pt-6 px-6 md:px-12 bg-white"> {/* Padding disesuaikan */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-slate-50">
            
            {/* Brand Column (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF6B4A] rounded-lg flex items-center justify-center shadow-md">
                  <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-800">
                  Learnify<span className="text-[#FF6B4A]">.</span>
                </span>
              </Link>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Platform edukasi digital untuk mengasah skill profesional Anda dengan metode fleksibel dan mentor ahli.
              </p>
              <div className="flex gap-3 pt-1">
                {[
                  { icon: <Instagram size={16} />, key: "ig" },
                  { icon: <Twitter size={16} />, key: "tw" },
                  { icon: <Linkedin size={16} />, key: "li" },
                  { icon: <Youtube size={16} />, key: "yt" }
                ].map((item) => (
                  <Link key={item.key} href="#" className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#FF6B4A] hover:text-white transition-all shadow-sm">
                    {item.icon}
                  </Link>
                ))}
              </div>
            </div>

            {/* Links Columns (7 Cols) */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Program</h4>
                <ul className="space-y-2.5">
                  {["Online Course", "Bootcamp", "Corporate"].map((item) => (
                    <li key={item}><Link href="#" className="text-xs text-slate-500 hover:text-[#FF6B4A] transition-colors">{item}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Perusahaan</h4>
                <ul className="space-y-2.5">
                  {["Tentang Kami", "Karir", "Blog"].map((item) => (
                    <li key={item}><Link href="#" className="text-xs text-slate-500 hover:text-[#FF6B4A] transition-colors">{item}</Link></li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Bantuan</h4>
                <ul className="space-y-2.5">
                  {["Pusat Bantuan", "Kontak", "Privacy"].map((item) => (
                    <li key={item}><Link href="#" className="text-xs text-slate-500 hover:text-[#FF6B4A] transition-colors">{item}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              © 2026 Learnify Indonesia.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tighter">Terms</Link>
              <Link href="#" className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tighter">Cookie</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
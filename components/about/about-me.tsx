"use client";

import React from "react";
import Navbar from "../navbar";
import Footer from "../footer";
import { Target, Users, Lightbulb, Rocket, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { label: "Siswa Aktif", value: "20,000+", icon: <Users size={20} /> },
    { label: "Mentor Ahli", value: "150+", icon: <Heart size={20} /> },
    { label: "Kursus Digital", value: "300+", icon: <Rocket size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#1E1E1E] font-sans">
      <Navbar />

      <main>
        {/* --- HERO SECTION --- */}
        <section className="pt-20 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6B4A] px-4 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
              <Lightbulb size={14} /> Our Story
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Membangun Jembatan Menuju <span className="text-[#FF6B4A]">Masa Depan Digital.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
              Learnify lahir dari keyakinan bahwa pendidikan berkualitas tinggi harus bisa diakses oleh siapa saja, di mana saja, untuk menciptakan talenta profesional yang siap bersaing global.
            </p>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:border-orange-100 transition-all">
                <div className="w-14 h-14 bg-orange-50 text-[#FF6B4A] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- VISION & MISSION --- */}
        <section className="py-20 px-6 bg-slate-50/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900">Misi Kami</h2>
                <p className="text-slate-500 leading-relaxed">
                  Kami tidak hanya memberikan materi, tapi membangun ekosistem pendukung yang membantu setiap individu mencapai potensi maksimalnya.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Kurikulum Terkurasi", desc: "Materi disusun oleh praktisi industri ahli.", icon: <Target size={18} /> },
                  { title: "Belajar Fleksibel", desc: "Akses materi kapan saja tanpa batasan waktu.", icon: <ShieldCheck size={18} /> },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-[#FF6B4A]">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Image Placeholder dengan gaya aesthetic */}
              <div className="aspect-square bg-white p-4 rounded-[3rem] shadow-2xl relative z-10 overflow-hidden">
                 <div className="w-full h-full bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 font-bold italic">
                    [ Foto Kantor/Tim Learnify ]
                 </div>
              </div>
              {/* Ornamen dekoratif */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#FF6B4A] rounded-full blur-[60px] opacity-20" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500 rounded-full blur-[80px] opacity-10" />
            </div>
          </div>
        </section>

        {/* --- TEAM/CULTURE SHORT --- */}
        <section className="py-24 px-6 text-center max-w-4xl mx-auto space-y-8">
           <h2 className="text-3xl font-black text-slate-900">Budaya Belajar di Learnify</h2>
           <p className="text-slate-400 leading-relaxed">
              Kami percaya bahwa belajar bukan sekadar menghafal, melainkan memahami proses dan berani berinovasi. Di sini, setiap kegagalan adalah langkah menuju keberhasilan.
           </p>
           <div className="flex flex-wrap justify-center gap-4">
              {["Inovatif", "Kolaboratif", "Eksklusif", "Terjangkau"].map((tag) => (
                <span key={tag} className="px-6 py-2 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                  #{tag}
                </span>
              ))}
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
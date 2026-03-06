"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  ChevronRight,
  Play,
} from "lucide-react";

export default function LearnifyPage() {
  return (
    <div className="min-h-screen bg-white text-[#1E1E1E] font-sans">
      {/* --- NAVBAR --- */}
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
              {/* Link Kursus dengan efek titik */}
              <Link
                href="/courses"
                className="hover:text-[#FF6B4A] transition-colors flex items-center gap-1.5 group"
              >
                Kursus
                <span className="w-1.5 h-1.5 bg-[#FF6B4A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              {/* Menu Katalog - Sekarang jadi Link biasa tanpa panah */}
              <Link
                href="/catalog"
                className="hover:text-[#FF6B4A] transition-colors"
              >
                Katalog
              </Link>

              {/* Menu Tentang Kami */}
              <Link
                href="/about"
                className="hover:text-[#FF6B4A] transition-colors"
              >
                Tentang Kami
              </Link>

              {/* Menu Hubungi Kami */}
              <Link
                href="/contact"
                className="hover:text-[#FF6B4A] transition-colors"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Icon (Opsional untuk akses cepat) */}
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

            {/* --- AUTH SECTION (Symmetrical Style) --- */}
            <div className="flex items-center gap-3">
              {/* Tombol Masuk */}
              <Link
                href="/login"
                className="px-6 py-2 text-[14px] font-bold text-slate-600 border border-slate-200 rounded-full hover:text-[#FF6B4A] hover:border-[#FF6B4A] hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-orange-100"
              >
                Masuk
              </Link>

              {/* Tombol Daftar */}
              <Link
                href="/signup"
                className="px-6 py-2 text-[14px] font-bold text-slate-600 border border-slate-200 rounded-full hover:text-[#FF6B4A] hover:border-[#FF6B4A] hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-orange-100"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto">
        {/* --- HERO SECTION --- */}
        <section className="px-6 md:px-12 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="flex-1 space-y-8 z-10">
            <div className="inline-block">
              <span className="bg-orange-50 text-[#FF6B4A] px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
                Investasi Terbaik Adalah Ilmu
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Kuasai keahlian baru <br />
              kapanpun Anda mau <br />
              <span className="text-slate-900">bersama Learnify</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
              Jadilah versi terbaik diri Anda dengan akses materi eksklusif.
              Kami hadir untuk memastikan perjalanan belajar Anda menjadi lebih
              mudah, fleksibel, dan tanpa batas.
            </p>

            <div className="flex items-center p-2 bg-white shadow-2xl shadow-slate-200 rounded-2xl max-w-xl border border-slate-50">
              <div className="px-6 border-r border-slate-100 text-slate-500 font-medium flex items-center gap-2 cursor-pointer">
                Kategori <ChevronDown className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Mau belajar apa hari ini?"
                className="flex-1 px-6 outline-none text-slate-700 placeholder-slate-300 w-full"
              />
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl h-12 px-8 font-bold flex gap-2">
                <Search className="h-5 w-5" /> Temukan
              </Button>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] bg-gradient-to-br from-[#FFEDEB] to-[#FFF5F4] rounded-[3rem] overflow-visible flex items-end justify-center">
              <div className="relative z-10 w-[85%] h-[90%] bg-slate-200 rounded-t-full overflow-hidden border-8 border-white border-b-0">
                <img
                  src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070"
                  alt="Student"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative Icons */}
              <div className="absolute top-20 -left-6 bg-white p-4 rounded-2xl shadow-xl">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-500">
                  🚀
                </div>
              </div>
              <div className="absolute top-32 -right-4 bg-white p-4 rounded-2xl shadow-xl">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-500">
                  ✨
                </div>
              </div>
              <div className="absolute bottom-40 -left-10 bg-white p-4 rounded-2xl shadow-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                  🏆
                </div>
              </div>
              <div className="absolute bottom-10 -right-8 bg-white p-4 rounded-2xl shadow-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 text-xs font-bold">
                  A+
                  <br />
                  Top
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION (Video & Classes) --- */}
        <section className="py-24 bg-white px-6 md:px-12">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1E1B4B]">
              Belajar tanpa hambatan dengan <br /> kualitas visual premium
            </h2>
            <p className="text-gray-400 max-w-3xl mx-auto leading-relaxed text-sm">
              Kami percaya kualitas materi menentukan kecepatan pemahaman.
              Nikmati setiap modul dengan resolusi terbaik yang memanjakan mata,
              audio yang presisi, serta sesi interaksi langsung yang mendalam.
            </p>
            <div className="pt-4">
              <Button className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-10 h-12 rounded-xl font-bold transition-all shadow-lg shadow-purple-100">
                Eksplorasi Kelas
              </Button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 grid grid-cols-6 gap-2 opacity-20 hidden md:grid">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-orange-600 rounded-full" />
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-50 relative overflow-hidden">
              <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=2070"
                  alt="Live Session"
                  className="w-full h-full object-cover"
                />

                <div className="absolute bottom-6 left-6 w-32 md:w-44 aspect-[3/4] rounded-2xl border-4 border-white shadow-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1972"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute bottom-6 inset-x-0 flex justify-center gap-4">
                  <button className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                    <span className="sr-only">Tutup</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.04 19.75 19.75 0 0 1-6.14-6.14 19.8 19.8 0 0 1-3.04-8.62 2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72 12.81 12.81 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4z"></path>
                    </svg>
                  </button>
                  <button className="w-12 h-12 bg-[#A855F7] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform">
                    <ChevronRight className="h-6 w-6 rotate-[-90deg]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-[#FFF5F4] p-6 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-orange-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                </div>
                <span className="font-bold text-slate-800">Siniar Belajar</span>
              </div>

              <div className="bg-[#F5F3FF] p-6 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-purple-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-[10px] font-black">((●))</span>
                    <span className="text-[8px] font-bold uppercase">
                      Aktif
                    </span>
                  </div>
                </div>
                <span className="font-bold text-slate-800">
                  Kelas Interaktif
                </span>
              </div>

              <div className="bg-[#F0FDF4] p-6 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-green-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <span className="font-bold text-slate-800">Library Video</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- QUALIFIED LESSONS SECTION --- */}
        <section className="py-24 bg-[#FDFDFF]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            {/* Header Section */}
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
                Kurikulum terkurasi untuk masa depan
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
                Pilih jenjang yang sesuai dengan ambisi Anda. Dari dasar hingga
                mahir, setiap materi disusun oleh para ahli di bidangnya untuk
                memastikan hasil belajar yang maksimal.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {/* Tab: Level Dasar */}
              <button className="px-8 py-3 rounded-xl font-bold text-slate-600 border-2 border-transparent hover:border-orange-100 hover:bg-orange-50/30 hover:text-[#FF6B4A] hover:scale-105 active:scale-95 transition-all duration-300">
                Level Dasar
              </button>

              {/* Tab: Level Menengah (Aktif) */}
<button className="px-8 py-3 rounded-xl font-bold text-slate-600 border-2 border-transparent hover:border-orange-100 hover:bg-orange-50/30 hover:text-[#FF6B4A] hover:scale-105 active:scale-95 transition-all duration-300">
                Level Menengah
              </button>

              {/* Tab: Level Profesional */}
              <button className="px-8 py-3 rounded-xl font-bold text-slate-600 border-2 border-transparent hover:border-orange-100 hover:bg-orange-50/30 hover:text-[#FF6B4A] hover:scale-105 active:scale-95 transition-all duration-300">
                Level Profesional
              </button>
            </div>

            {/* Lesson Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  id: 1,
                  title: "Modul Dasar",
                  color: "bg-orange-400",
                  desc: "Membangun pondasi berpikir kritis dengan 7 pilar utama pembelajaran...",
                },
                {
                  id: 2,
                  title: "Modul Teknis",
                  color: "bg-slate-700",
                  desc: "Mengembangkan kemampuan teknis secara mendalam melalui praktik nyata...",
                },
                {
                  id: 3,
                  title: "Modul Strategis",
                  color: "bg-emerald-400",
                  desc: "Penerapan strategi dalam dunia profesional dengan standar kualitas tinggi...",
                },
                {
                  id: 4,
                  title: "Modul Dukungan",
                  color: "bg-slate-800",
                  desc: "Menyediakan layanan bantuan dan pendampingan khusus bagi peserta didik...",
                },
                {
                  id: 5,
                  title: "Modul Fasilitas",
                  color: "bg-cyan-400",
                  desc: "Optimalisasi sumber daya belajar digital untuk efisiensi pemahaman materi...",
                },
                {
                  id: 6,
                  title: "Modul Solusi",
                  color: "bg-orange-600",
                  desc: "Langkah-languka taktis dalam menyelesaikan masalah dan komplain secara profesional...",
                },
                {
                  id: 7,
                  title: "Modul Manajemen",
                  color: "bg-red-600",
                  desc: "Tata kelola kepemimpinan yang esensial bagi pengembangan organisasi...",
                },
                {
                  id: 8,
                  title: "Modul Mastery",
                  color: "bg-amber-500",
                  desc: "Tahap akhir penguasaan materi dengan solusi komprehensif berbasis data...",
                },
              ].map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-50 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-300"
                >
                  <div
                    className={`w-12 h-12 ${lesson.color} text-white rounded-full flex items-center justify-center font-bold text-lg mb-6 shadow-lg`}
                  >
                    {lesson.id}
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {lesson.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3 italic">
                    {lesson.desc}
                  </p>

                  <Button
                    variant="outline"
                    className="mt-auto border-purple-100 text-purple-500 rounded-xl px-8 hover:bg-purple-500 hover:text-white transition-colors"
                  >
                    Buka Modul
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-16">
              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-10 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-purple-100">
                Lihat Seluruh Katalog
              </Button>
            </div>
          </div>
        </section>

        {/* --- COLLEGE LEVEL SECTION (CTA) --- */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto bg-[#F8F8FF] rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center p-8 md:p-16 gap-12 relative">
            <div className="absolute right-[20%] top-10 w-32 h-32 grid grid-cols-8 gap-2 opacity-30">
              {[...Array(64)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-purple-600 rounded-full" />
              ))}
            </div>

            <div className="flex-1 space-y-8 z-10">
              <div className="inline-block">
                <span className="bg-purple-100 text-[#8B5CF6] px-6 py-2 rounded-full text-sm font-bold">
                  Akademik & Karir
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Jangan biarkan waktu <br />
                terbuang sia-sia. Ayo <br />
                bangun portofolio Anda.
              </h2>

              <p className="text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
                Dunia bergerak cepat, pastikan keahlian Anda tetap relevan.
                Dapatkan akses ke materi tingkat lanjut yang akan membantu Anda
                bersaing di industri global.
              </p>

              <Button className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-10 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-purple-100 transition-all">
                Gabung Sekarang
              </Button>
            </div>

            <div className="flex-1 relative flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1523240715630-341646700078?q=80&w=2070"
                  alt="Talent"
                  className="w-full h-full object-contain relative z-10"
                />

                <div className="absolute top-1/4 -left-8 bg-white p-3 rounded-xl shadow-xl z-20 animate-bounce">
                  <div className="w-8 h-8 flex items-center justify-center font-bold text-orange-500 bg-orange-50 rounded-lg">
                    🚀
                  </div>
                </div>

                <div className="absolute top-10 -right-4 bg-white p-3 rounded-xl shadow-xl z-20">
                  <div className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 rounded-lg">
                    ⭐
                  </div>
                </div>

                <div className="absolute bottom-1/3 -right-10 bg-white p-3 rounded-xl shadow-xl z-20 animate-pulse">
                  <div className="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 rounded-lg font-black text-xs">
                    GO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- MENTOR SECTION --- */}
        <section className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-gradient-to-tr from-orange-100 to-transparent rounded-full opacity-50 blur-3xl" />

              <div className="relative w-full aspect-square max-w-md mx-auto overflow-hidden rounded-full border-[16px] border-white shadow-2xl shadow-orange-100">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974"
                  alt="Expert Mentor"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Punya keahlian menarik? <br /> Mari menginspirasi <br /> bersama
                kami
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                Tinggalkan jejak bermanfaat dengan menjadi bagian dari tim
                pengajar kami. Bantu jutaan orang menemukan potensi mereka dan
                bangun reputasi Anda sebagai ahli di bidangnya.
              </p>

              <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-10 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-purple-100 transition-all">
                Daftar Sebagai Mentor
              </Button>
            </div>
          </div>
        </section>

        {/* --- SUBSCRIBE SECTION --- */}
        <section className="pb-24 px-6 md:px-12">
          <div className="max-w-[1440px] mx-auto bg-[#0F172A] rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center">
            {/* Dekorasi tetap sama */}
            <div className="absolute top-10 left-10 md:left-20 w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden hidden sm:block">
              <img src="https://i.pravatar.cc/150?u=1" alt="student" />
            </div>
            {/* ... dekorasi avatar lainnya ... */}

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

                {/* Social icons tetap ... */}

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
                  links: [
                    "Kelas Intensif",
                    "Workshop Virtual",
                    "Materi Mandiri",
                    "Video On-Demand",
                    "Pelatihan Luring",
                  ],
                },
                {
                  title: "Jejaring",
                  links: [
                    "Alumni",
                    "Partner Strategis",
                    "Kontributor",
                    "Riwayat",
                    "Jurnal",
                    "Portal Mentor",
                  ],
                },
                {
                  title: "Navigasi",
                  links: [
                    "Beranda",
                    "Edu-Professional",
                    "Daftar Kursus",
                    "Informasi Pendaftaran",
                    "Ulasan Siswa",
                    "Program Khusus",
                  ],
                },
                {
                  title: "Legalitas",
                  links: [
                    "Kabar Terbaru",
                    "Investor",
                    "Syarat & Ketentuan",
                    "Kebijakan Privasi",
                    "Pusat Bantuan",
                    "Hubungi Kami",
                  ],
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
      </main>
    </div>
  );
}

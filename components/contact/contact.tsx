"use client";

import React, { useState } from "react";
import { 
  Mail, MapPin, Phone, MessageSquare, Send, 
  ChevronDown, HelpCircle, Globe, Zap 
} from "lucide-react";
import Navbar from "../navbar";
import Footer from "../footer";

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Bagaimana cara mendaftar kursus?", a: "Pilih kursus yang Anda inginkan, klik daftar, dan selesaikan pembayaran melalui dashboard Anda." },
    { q: "Apakah ada sertifikat setelah lulus?", a: "Ya, setiap kursus yang diselesaikan akan mendapatkan sertifikat digital resmi yang dapat diunduh." },
    { q: "Bisa refund jika tidak cocok?", a: "Kami menyediakan kebijakan refund 3 hari setelah pembelian sesuai syarat dan ketentuan." }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-[#1E1E1E] font-sans">
      <Navbar />

      {/* --- HERO CONTACT --- */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6B4A] px-4 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
            <Globe size={14} /> Get in Touch
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            Ada yang bisa kami <span className="text-[#FF6B4A]">bantu?</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Tim kami siap menjawab pertanyaan teknis, kolaborasi bisnis, atau sekadar menyapa Anda.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- SIDE INFO (1 COL) --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                  <Zap size={24} fill="currentColor" />
                </div>
                <h3 className="font-bold text-slate-800 text-xl mb-2">Layanan 24/7</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Sistem kami aktif setiap hari untuk membantu kebutuhan belajar Anda kapan saja.
                </p>
                <div className="flex items-center gap-3 text-green-600 font-bold text-sm bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Sistem Aktif & Normal
                </div>
              </div>
              {/* Dekorasi halus */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full blur-3xl opacity-50 transition-transform group-hover:scale-150" />
            </div>

            {/* WhatsApp Card */}
            <div className="bg-[#100E2E] p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="font-bold mb-4 text-lg">Hubungi via WA</h3>
                <p className="text-white/60 text-sm mb-8 leading-relaxed">
                  Butuh respon instan? Tim support kami tersedia di WhatsApp untuk bantuan cepat.
                </p>
                <button className="bg-white text-[#100E2E] w-full py-4 rounded-2xl font-bold text-sm hover:bg-[#FF6B4A] hover:text-white transition-all duration-300 shadow-lg active:scale-95">
                  Chat WhatsApp
                </button>
              </div>
              {/* Dekorasi oranye khas Learnify */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FF6B4A]/20 rounded-full blur-3xl transition-transform group-hover:scale-150" />
            </div>
          </div>

          {/* --- CONTACT FORM (2 COLS) --- */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-orange-50 text-[#FF6B4A] rounded-[1.25rem] flex items-center justify-center shadow-inner">
                <MessageSquare size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kirim Pesan</h2>
              </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input type="text" className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all" placeholder="Fauzi Aditya" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                  <input type="email" className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all" placeholder="fauzi@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Subjek Pertanyaan</label>
                <div className="relative">
                  <select className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all appearance-none cursor-pointer">
                    <option>Tanya Mengenai Kursus</option>
                    <option>Masalah Teknis/Login</option>
                    <option>Kerjasama Mentor</option>
                    <option>Lainnya</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesan Anda</label>
                <textarea rows={5} className="w-full bg-[#F8F9FB] border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-semibold outline-none transition-all resize-none" placeholder="Ceritakan apa yang ingin Anda tanyakan..."></textarea>
              </div>

              <button className="group w-full bg-[#FF6B4A] text-white py-5 rounded-2xl font-bold text-sm hover:bg-[#fa5a36] transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-100 active:scale-[0.98]">
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /> 
                Kirim Pesan Sekarang
              </button>
            </form>
          </div>
        </div>

        {/* --- FAQ SECTION --- */}
        <section className="mt-32 max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl font-black text-slate-800">Sering Ditanyakan</h2>
            <p className="text-slate-400">Mungkin jawaban yang Anda cari ada di sini.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${openFaq === index ? 'border-orange-100 shadow-xl shadow-orange-50' : 'border-slate-50 shadow-sm'}`}>
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left group"
                >
                  <span className={`font-bold transition-colors flex items-center gap-4 ${openFaq === index ? 'text-[#FF6B4A]' : 'text-slate-700'}`}>
                    <HelpCircle size={20} className={openFaq === index ? 'text-[#FF6B4A]' : 'text-slate-300'} /> 
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openFaq === index ? 'bg-orange-50 text-[#FF6B4A] rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-8 text-sm text-slate-500 leading-[1.8] animate-in slide-in-from-top-4 duration-300">
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-50">
                      {faq.a}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
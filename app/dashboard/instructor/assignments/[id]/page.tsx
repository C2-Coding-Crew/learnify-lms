"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, FileText, User, Calendar, CheckCircle, Award, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

export default function GradeAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const submissionId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch(`/api/instructor/submissions/${submissionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSubmission(data);
        setGrade(data.grade?.toString() || "");
        setFeedback(data.feedback || "");
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [submissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/instructor/submissions/${submissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: parseFloat(grade), feedback }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan nilai");
      
      toast.success("Penilaian Berhasil", `Nilai untuk ${submission.user.name} telah disimpan.`);
      router.push("/dashboard/instructor/assignments");
    } catch (err: any) {
      toast.error("Gagal", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#FF6B4A]" size={40} /></div>;
  if (!submission) return <div className="p-10 text-center font-bold text-slate-400">Submission tidak ditemukan.</div>;

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1000px] mx-auto w-full">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B4A] transition-colors mb-8 font-black text-sm group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar Penugasan
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detail Penyerahan (Kiri) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
            
            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-[#FF6B4A] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-100">
                {submission.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{submission.assignment.title}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                     <User size={12} className="text-orange-500" /> {submission.user.name}
                  </p>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                     <Calendar size={12} className="text-orange-500" /> {new Date(submission.createdDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4 flex items-center gap-2">
                   <FileText size={14} className="text-orange-500" /> Jawaban Siswa
                </h3>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[200px] font-medium text-[15px]">
                  {submission.content || "Siswa tidak memberikan teks jawaban."}
                </div>
              </div>

              {submission.fileUrl && (
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Lampiran File</h3>
                  <a 
                    href={submission.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-5 p-5 bg-white border border-slate-200 rounded-[1.5rem] hover:border-[#FF6B4A] hover:bg-orange-50/20 transition-all group shadow-sm"
                  >
                    <div className="w-14 h-14 bg-orange-50 text-[#FF6B4A] rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                      <FileText size={28} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-black text-slate-800">File Penyerahan Tugas</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Klik untuk Pratinjau / Unduh</p>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Penilaian (Kanan) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 sticky top-8">
            <div className="flex items-center gap-3 mb-8">
               <Award size={24} className="text-orange-500" />
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Penilaian</h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Nilai Akhir (0-100)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    required
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full h-20 bg-slate-50 border border-slate-100 rounded-[1.5rem] px-8 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-black text-4xl text-[#FF6B4A] shadow-inner text-center"
                    placeholder="0"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 font-black text-lg">PTS</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1 flex items-center gap-2">
                   <MessageCircle size={14} className="text-orange-500" /> Feedback Mentor
                </label>
                <textarea 
                  rows={6}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Tuliskan saran atau koreksi membangun untuk siswa..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 outline-none focus:ring-4 focus:ring-orange-100 focus:bg-white transition-all font-medium text-sm resize-none shadow-inner"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-[2rem] h-16 font-black shadow-xl shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle size={24} />}
                Simpan & Rilis Nilai
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

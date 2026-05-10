"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, FileText, User, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GradeAssignmentPage() {
  const params = useParams();
  const router = useRouter();
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
      alert("Nilai berhasil disimpan!");
      router.push("/dashboard/instructor/assignments");
    } catch (err: any) {
      alert(err.message);
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
        className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B4A] transition-colors mb-6 font-bold text-sm group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Daftar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detail Penyerahan (Kiri) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-orange-100 text-[#FF6B4A] rounded-2xl flex items-center justify-center font-black text-xl">
                {submission.user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">{submission.assignment.title}</h1>
                <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                   <User size={14} /> {submission.user.name} • <Calendar size={14} /> {new Date(submission.createdDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Jawaban Siswa</h3>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap min-h-[150px]">
                  {submission.content || "Siswa tidak memberikan teks jawaban."}
                </div>
              </div>

              {submission.fileUrl && (
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">File Terlampir</h3>
                  <a 
                    href={submission.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-[#FF6B4A] transition-colors group"
                  >
                    <div className="w-12 h-12 bg-orange-50 text-[#FF6B4A] rounded-xl flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">Lihat/Download File Penyerahan</p>
                      <p className="text-[10px] text-slate-400 font-medium">Klik untuk membuka di tab baru</p>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Penilaian (Kanan) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 sticky top-8">
            <h3 className="text-lg font-black text-slate-800 mb-6">Penilaian</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nilai (0-100)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  required
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:ring-2 focus:ring-orange-100 transition-all font-black text-2xl text-[#FF6B4A]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Feedback</label>
                <textarea 
                  rows={5}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Berikan saran atau koreksi untuk siswa..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-100 transition-all font-medium text-sm resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-[1.5rem] h-14 font-black shadow-lg shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                Simpan Nilai
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

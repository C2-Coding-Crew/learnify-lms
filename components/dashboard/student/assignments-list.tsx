"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock, Upload, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  course: string;
  courseSlug: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade: string | null;
  feedback: string | null;
  submittedContent: string | null;
  submittedFileUrl: string | null;
}

export default function AssignmentsList({ initialAssignments }: { initialAssignments: Assignment[] }) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [activeModal, setActiveModal] = useState<Assignment | null>(null);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const openModal = (a: Assignment) => {
    setActiveModal(a);
    setContent(a.submittedContent || "");
    setFileUrl(a.submittedFileUrl || "");
  };

  const closeModal = () => {
    setActiveModal(null);
    setContent("");
    setFileUrl("");
  };

  const handleSubmit = async () => {
    if (!content.trim() && !fileUrl.trim()) {
      toast.error("Validasi Gagal", { description: "Isi jawaban atau lampirkan URL file." });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/student/assignments/${activeModal!.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, fileUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim tugas");

      toast.success("Berhasil!", { description: "Tugasmu berhasil dikirim." });

      // Update local state
      setAssignments(assignments.map(a =>
        a.id === activeModal!.id
          ? { ...a, status: "submitted", submittedContent: content, submittedFileUrl: fileUrl }
          : a
      ));

      closeModal();
      router.refresh();
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    pending: assignments.filter(a => a.status === "pending").length,
    submitted: assignments.filter(a => a.status === "submitted").length,
    graded: assignments.filter(a => a.status === "graded").length,
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Pending", value: stats.pending.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Submitted", value: stats.submitted.toString(), icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Graded", value: stats.graded.toString(), icon: FileText, color: "text-green-600", bg: "bg-green-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-8">
        <h3 className="font-black text-slate-800 text-lg mb-6">All Assignments</h3>
        <div className="grid gap-4">
          {assignments.length === 0 ? (
            <div className="p-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              Belum ada tugas untuk kursus yang Anda ambil.
            </div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="p-5 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    a.status === "pending" ? "bg-orange-50 text-orange-500" :
                    a.status === "submitted" ? "bg-blue-50 text-blue-500" :
                    "bg-green-50 text-green-500"
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{a.title}</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{a.course} · Due {a.dueDate}</p>
                    {a.feedback && (
                      <p className="text-xs text-indigo-500 font-medium mt-1 italic">💬 "{a.feedback}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {a.grade && (
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilai</p>
                      <p className="text-xl font-black text-green-600">{a.grade}</p>
                    </div>
                  )}
                  <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg ${
                    a.status === "pending" ? "bg-orange-50 text-orange-500" :
                    a.status === "submitted" ? "bg-blue-50 text-blue-500" :
                    "bg-green-50 text-green-600"
                  }`}>
                    {a.status}
                  </span>

                  {a.status === "pending" && (
                    <Button
                      onClick={() => openModal(a)}
                      className="h-9 px-5 bg-[#FF6B4A] text-white rounded-xl font-bold text-xs hover:bg-[#fa5a36] transition-colors shadow-md shadow-orange-100"
                    >
                      <Upload size={14} className="mr-1.5" /> Submit
                    </Button>
                  )}

                  {a.status === "submitted" && (
                    <Button
                      onClick={() => openModal(a)}
                      variant="outline"
                      className="h-9 px-5 rounded-xl font-bold text-xs"
                    >
                      Edit Jawaban
                    </Button>
                  )}

                  {a.status === "graded" && (
                    <Button
                      onClick={() => openModal(a)}
                      variant="outline"
                      className="h-9 px-5 rounded-xl font-bold text-xs"
                    >
                      Lihat Detail
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl relative">
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black text-[#FF6B4A] uppercase tracking-widest mb-1">{activeModal.course}</p>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{activeModal.title}</h2>
                  <p className="text-xs text-slate-400 mt-1 font-medium">Due: {activeModal.dueDate}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              {activeModal.description && (
                <div className="p-4 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{activeModal.description}</p>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="p-8 pt-4 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Jawaban / Penjelasan</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  disabled={activeModal.status === "graded"}
                  rows={5}
                  placeholder="Tuliskan jawaban atau penjelasan tugasmu di sini..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium resize-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Link File (Google Drive, GitHub, dll.)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={e => setFileUrl(e.target.value)}
                    disabled={activeModal.status === "graded"}
                    placeholder="https://drive.google.com/..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium disabled:opacity-60"
                  />
                  {fileUrl && (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-colors"
                    >
                      <ExternalLink size={16} className="text-slate-500" />
                    </a>
                  )}
                </div>
              </div>

              {activeModal.feedback && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Feedback Instruktur</p>
                  <p className="text-sm font-medium text-indigo-700 leading-relaxed">{activeModal.feedback}</p>
                </div>
              )}

              {activeModal.status !== "graded" ? (
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={closeModal} className="flex-1 rounded-2xl font-bold h-12">
                    Batal
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="flex-1 bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-2xl font-black h-12 shadow-lg shadow-orange-100"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Upload size={18} className="mr-2" />}
                    {activeModal.status === "submitted" ? "Update Jawaban" : "Kirim Tugas"}
                  </Button>
                </div>
              ) : (
                <Button onClick={closeModal} className="w-full rounded-2xl font-bold h-12 bg-slate-100 text-slate-600 hover:bg-slate-200">
                  Tutup
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

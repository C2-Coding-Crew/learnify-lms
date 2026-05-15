"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Video, Calendar, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

export default function LiveCRUD({ 
  initialSessions, 
  instructorCourses 
}: { 
  initialSessions: any[], 
  instructorCourses: any[] 
}) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    courseId: instructorCourses.length > 0 ? instructorCourses[0].id : 0,
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
  });

  const handleOpenAdd = () => {
    if (instructorCourses.length === 0) {
      toast.error("Tidak ada kursus", { description: "Anda harus memiliki minimal 1 kursus untuk membuat jadwal live." });
      return;
    }
    setIsEditing(false);
    setFormData({
      id: 0,
      courseId: instructorCourses[0].id,
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      location: "",
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (session: any) => {
    setIsEditing(true);
    setFormData({
      id: session.id,
      courseId: session.courseId,
      title: session.title,
      description: session.description || "",
      // Convert to local datetime-local format string
      startTime: new Date(session.rawStartTime).toISOString().slice(0, 16),
      endTime: new Date(session.rawEndTime).toISOString().slice(0, 16),
      location: session.location || "",
    });
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) {
      toast.error("Validasi Gagal", { description: "Judul, Waktu Mulai, dan Selesai wajib diisi." });
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing
        ? `/api/instructor/live/${formData.id}`
        : `/api/instructor/live`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan jadwal");

      toast.success("Berhasil", { description: `Jadwal live berhasil ${isEditing ? "diperbarui" : "dibuat"}` });
      setIsSheetOpen(false);
      router.refresh();
      
      // Opt UI update skip for simplicity, page will refresh
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan dan menghapus jadwal live ini?")) return;
    
    setLoadingId(id);
    try {
      const res = await fetch(`/api/instructor/live/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus jadwal");
      
      toast.success("Berhasil", { description: "Jadwal live telah dibatalkan" });
      router.refresh();
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-slate-800 text-lg">Upcoming Sessions</h3>
        <Button onClick={handleOpenAdd} className="h-10 px-5 bg-orange-50 text-[#FF6B4A] hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
          <Plus size={16} /> Schedule Live
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((liveSession) => (
          <div key={liveSession.id} className="p-6 border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-slate-100 transition-all group bg-white relative">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button onClick={() => handleOpenEdit(liveSession)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-500 rounded-lg">
                 <Edit2 size={14} />
               </button>
               <button onClick={() => handleDelete(liveSession.id)} disabled={loadingId === liveSession.id} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg">
                 {loadingId === liveSession.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
               </button>
            </div>

            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Video size={24} />
            </div>
            <h4 className="font-black text-slate-800 text-lg mb-1">{liveSession.title}</h4>
            <p className="text-[10px] font-bold text-[#FF6B4A] mb-4 uppercase tracking-widest">{liveSession.courseTitle}</p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {liveSession.date}</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {liveSession.attendees}</span>
            </div>
            <a href={liveSession.location || "#"} target="_blank" rel="noopener noreferrer" className="w-full h-12 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors flex items-center justify-center">
              Join Link
            </a>
          </div>
        ))}
        
        <div onClick={handleOpenAdd} className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer min-h-[220px]">
          <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Plus size={20} />
          </div>
          <p className="font-bold text-slate-500">Plan a new session</p>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white border-l-slate-100 sm:max-w-md w-[90vw] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-black text-slate-800">
              {isEditing ? "Edit Live Session" : "Schedule Live Session"}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              Buat jadwal sesi live atau webinar untuk murid di kursus Anda.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 pb-20">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Terkait Kursus</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
              >
                {instructorCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Judul Sesi</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
                placeholder="Contoh: Q&A Session Chapter 1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Waktu Mulai</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Waktu Selesai</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Meeting Link / URL</label>
              <input
                type="url"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
                placeholder="https://zoom.us/j/..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Deskripsi (Opsional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium min-h-[100px]"
                placeholder="Tambahkan detail atau agenda live session"
              />
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="rounded-xl font-bold flex-1">
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-xl font-bold flex-1 shadow-lg shadow-orange-500/20">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Plus, Megaphone, Calendar, BookOpen, Loader2, Send, Trash2, X, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

interface Announcement {
  id: number;
  courseId: number;
  title: string;
  content: string;
  createdDate: string;
  course: { title: string };
}

interface AnnouncementsClientProps {
  courses: { id: number; title: string }[];
}

export default function AnnouncementsClient({ courses }: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ courseId: "", title: "", content: "" });
  const toast = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/instructor/announcements");
      const data = await res.json();
      if (!data.error) setAnnouncements(data);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setFormData({
      courseId: ann.courseId.toString(),
      title: ann.title,
      content: ann.content
    });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ courseId: "", title: "", content: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title || !formData.content) return;
    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/instructor/announcements/${editingId}` : "/api/instructor/announcements";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.error) {
        toast.success("Berhasil", editingId ? "Pengumuman telah diperbarui." : "Pengumuman telah dipublikasikan.");
        setShowModal(false);
        fetchAnnouncements();
      } else {
        toast.error("Gagal", data.error);
      }
    } catch (err) {
      toast.error("Gagal", "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`/api/instructor/announcements/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Berhasil", "Pengumuman dihapus.");
        setAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      toast.error("Gagal", "Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#FF6B4A] text-white px-6 h-12 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-[#e55a3d] transition-all hover:-translate-y-0.5"
        >
          <Plus size={20} />
          New Announcement
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-slate-800">{editingId ? "Edit Announcement" : "Create Announcement"}</h3>
                 <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Course</label>
                    <select 
                      value={formData.courseId}
                      onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                      required
                    >
                      <option value="">Choose a course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. New Material Added"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full h-12 bg-slate-50 border-none rounded-2xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                      required
                    />
                 </div>
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Content</label>
                    <textarea 
                      placeholder="Write your announcement message..."
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full h-40 bg-slate-50 border-none rounded-3xl p-6 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                      required
                    />
                 </div>
                 <button 
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full h-12 bg-[#FF6B4A] text-white rounded-2xl font-black shadow-lg shadow-orange-100 flex items-center justify-center gap-2 hover:bg-[#e55a3d] transition-all disabled:opacity-50"
                 >
                   {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                   {editingId ? "Update Announcement" : "Publish Announcement"}
                 </button>
              </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF6B4A]" size={40} /></div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center gap-4">
             <Megaphone size={64} className="text-slate-200" />
             <p className="text-slate-400 font-bold">No announcements yet.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm relative group overflow-hidden flex flex-col md:flex-row gap-6">
               <div className="absolute top-0 left-0 w-2 h-full bg-[#FF6B4A] opacity-20 group-hover:opacity-100 transition-opacity" />
               
               {/* Left Actions */}
               <div className="flex md:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => handleOpenEdit(item)}
                    className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm"
                    title="Edit"
                  >
                     <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm"
                    title="Delete"
                  >
                     <Trash2 size={18} />
                  </button>
               </div>

               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-[#FF6B4A] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <BookOpen size={12} />
                        {item.course.title}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(item.createdDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-4">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

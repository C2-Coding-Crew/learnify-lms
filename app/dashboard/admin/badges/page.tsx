"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  Zap,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    description: "",
    imageUrl: "",
    criteria: "",
    pointsRequired: "0",
    status: 1
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/badges");
      const json = await res.json();
      if (Array.isArray(json)) {
        setBadges(json);
      } else {
        setBadges([]);
        if (json.error) toast.error("Gagal", json.error);
      }
    } catch (err) {
      console.error(err);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: 0, name: "", description: "", imageUrl: "", criteria: "", pointsRequired: "0", status: 1 });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setIsEditing(true);
    setFormData({
      id: b.id,
      name: b.name,
      description: b.description,
      imageUrl: b.imageUrl || "",
      criteria: b.criteria,
      pointsRequired: b.pointsRequired.toString(),
      status: b.status
    });
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.criteria) {
      toast.error("Validasi Gagal", "Harap lengkapi nama dan kriteria.");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing ? `/api/admin/badges/${formData.id}` : "/api/admin/badges";
      const method = isEditing ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Gagal menyimpan badge");
      
      toast.success("Berhasil", isEditing ? "Badge diperbarui" : "Badge ditambahkan");
      setIsSheetOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error("Gagal", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/badges/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus badge");
      toast.success("Berhasil", "Badge telah dihapus");
      setConfirmDeleteId(null);
      fetchData();
    } catch (err: any) {
      toast.error("Gagal", err.message);
      setConfirmDeleteId(null);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filtered = badges.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Badge Management 🏅
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Konfigurasi pencapaian untuk memotivasi siswa belajar lebih giat.
          </p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="h-12 px-6 bg-[#100E2E] hover:bg-[#1a1740] text-white rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center gap-2"
        >
          <Plus size={18} /> Buat Badge Baru
        </Button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="relative w-full md:w-96 mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Cari nama badge..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
             <Award size={48} className="text-slate-100 mb-2" />
             <p className="text-slate-400 font-bold">Belum ada lencana.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
             <table className="w-full text-sm whitespace-nowrap min-w-[1300px]">
               <thead>
                 <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="text-left pb-4 pl-4 sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f1f5f9]">Aksi</th>
                    <th className="text-left pb-4 pl-4">Lencana Utama</th>
                    <th className="text-left pb-4 pl-4">Poin & Kriteria</th>
                    <th className="text-left pb-4 pl-4">Status</th>
                    <th className="text-left pb-4 pl-4">Created By</th>
                    <th className="text-left pb-4 pl-4">Created Date</th>
                    <th className="text-left pb-4 pl-4">Last Update By</th>
                    <th className="text-left pb-4 pl-4 pr-4">Last Update Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filtered.map(b => (
                   <tr key={b.id} className="group hover:bg-slate-50 transition-colors">
                     {/* Aksi di kiri — sticky */}
                     <td className="py-4 pl-4 pr-6 sticky left-0 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#f1f5f9] transition-colors z-10">
                        <div className="flex items-center gap-2">
                           <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleOpenEdit(b)}
                            className="h-8 w-8 rounded-lg text-blue-500 border-blue-100 hover:bg-blue-50"
                           >
                             <Edit2 size={14} />
                           </Button>
                           <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => setConfirmDeleteId(b.id)}
                            disabled={loadingId === b.id}
                            className="h-8 w-8 rounded-lg text-red-500 border-red-100 hover:bg-red-50"
                           >
                             {loadingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                           </Button>
                        </div>
                     </td>

                     <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center p-1.5 shrink-0">
                            <img 
                              src={b.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${b.criteria}`} 
                              alt={b.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800">{b.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{b.criteria}</span>
                          </div>
                        </div>
                     </td>

                     <td className="py-4 pl-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-black text-indigo-600 text-xs">
                            <Zap size={12} fill="currentColor" /> {b.pointsRequired} Pts
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                            {b.description}
                          </p>
                        </div>
                     </td>

                     <td className="py-4 pl-4">
                        {b.status === 1 ? (
                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-green-100">Aktif</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-200">Nonaktif</span>
                        )}
                     </td>

                     {/* 4 Field Standar */}
                     <td className="py-4 pl-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                          {b.createdBy || "SYSTEM"}
                        </span>
                     </td>
                     <td className="py-4 pl-4 text-slate-500 font-medium text-[10px]">
                        {formatDate(b.createdDate)}
                     </td>
                     <td className="py-4 pl-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                          {b.lastUpdatedBy || "SYSTEM"}
                        </span>
                     </td>
                     <td className="py-4 pl-4 pr-4 text-slate-500 font-medium text-[10px]">
                        {formatDate(b.lastUpdatedDate)}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      <Modal
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={isEditing ? "Edit Lencana" : "Buat Lencana Baru"}
        description="Konfigurasi detail lencana pencapaian sistem."
      >
        <div className="space-y-6">
           <div className="space-y-2">
             <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Nama Badge</Label>
             <Input 
              placeholder="CONTOH: Pembelajar Gigih" 
              value={formData.name} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
              className="h-12 rounded-xl border-slate-100 font-bold"
             />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Kriteria Logic</Label>
               <Input 
                placeholder="QUIZ_SCORE_100" 
                value={formData.criteria} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, criteria: e.target.value})}
                className="h-12 rounded-xl border-slate-100 font-mono text-xs font-bold"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Poin Dibutuhkan</Label>
               <Input 
                type="number" 
                placeholder="100" 
                value={formData.pointsRequired} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, pointsRequired: e.target.value})}
                className="h-12 rounded-xl border-slate-100 font-bold"
               />
             </div>
           </div>

           <div className="space-y-2">
             <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">URL Gambar (Opsional)</Label>
             <Input 
              placeholder="https://example.com/badge.png" 
              value={formData.imageUrl} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, imageUrl: e.target.value})}
              className="h-12 rounded-xl border-slate-100 text-xs"
             />
           </div>

           <div className="space-y-2">
             <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Deskripsi</Label>
             <Textarea 
              placeholder="Jelaskan cara mendapatkan badge ini..." 
              value={formData.description} 
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
              className="rounded-xl border-slate-100 resize-none h-20 text-sm"
             />
           </div>

           <div className="space-y-2">
             <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Status</Label>
             <select 
              value={formData.status} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: Number(e.target.value)})}
              className="w-full h-12 rounded-xl border border-slate-100 px-3 bg-slate-50 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100"
             >
               <option value={1}>Aktif (Bisa Didapat)</option>
               <option value={0}>Nonaktif (Tersembunyi)</option>
             </select>
           </div>

           <div className="pt-4 flex gap-3">
             <Button 
               variant="outline"
               onClick={() => setIsSheetOpen(false)}
               className="flex-1 h-12 rounded-xl font-bold"
             >
               Batal
             </Button>
             <Button 
               onClick={handleSave} 
               disabled={isSaving}
               className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20"
             >
               {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
               Simpan Lencana
             </Button>
           </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirmed}
        title="Hapus Lencana"
        description="Apakah Anda yakin ingin menghapus lencana ini? Siswa yang sudah memilikinya mungkin akan kehilangan pencapaian ini."
        variant="danger"
        isLoading={loadingId !== null && loadingId === confirmDeleteId}
      />
    </main>
  );
}

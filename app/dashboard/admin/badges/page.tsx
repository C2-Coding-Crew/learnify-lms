"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  Star,
  Settings,
  Loader2,
  Lock,
  Zap
} from "lucide-react";
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
        if (json.error) toast.error(json.error);
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
      toast.error("Harap lengkapi nama dan kriteria.");
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
      
      toast.success(isEditing ? "Badge diperbarui" : "Badge ditambahkan");
      setIsSheetOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus badge ini?")) return;
    try {
      const res = await fetch(`/api/admin/badges/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus badge");
      toast.success("Badge dihapus");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama badge..." 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
             <Award size={48} className="text-slate-100 mb-2" />
             <p className="text-slate-400 font-bold">Belum ada badge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(b => (
              <div 
                key={b.id} 
                className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                   <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-inner">
                      <img 
                        src={b.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${b.criteria}`} 
                        alt={b.name}
                        className="w-full h-full object-contain"
                      />
                   </div>
                   <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEdit(b)}
                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(b.id)}
                        className="h-8 w-8 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                   </div>
                </div>

                <h3 className="font-black text-slate-800 mb-1">{b.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{b.criteria}</p>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4 min-h-[32px]">
                  {b.description}
                </p>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 font-black text-indigo-600 text-xs">
                      <Zap size={14} fill="currentColor" /> {b.pointsRequired} Pts
                   </div>
                   <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${b.status === 1 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {b.status === 1 ? 'Aktif' : 'Nonaktif'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white border-none sm:max-w-md w-[90vw] p-8 overflow-y-auto">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-black text-slate-800">
              {isEditing ? "Edit Badge" : "Badge Baru"}
            </SheetTitle>
            <SheetDescription className="text-slate-400 font-medium">
              Tentukan nama, kriteria, dan desain pencapaian.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nama Badge</Label>
               <Input 
                placeholder="CONTOH: Pembelajar Gigih" 
                value={formData.name} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                className="h-12 rounded-xl border-slate-100"
               />
             </div>
             
             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kriteria Sistem (Logic Key)</Label>
               <Input 
                placeholder="CONTOH: STREAK_7_DAYS, QUIZ_SCORE_100" 
                value={formData.criteria} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, criteria: e.target.value})}
                className="h-12 rounded-xl border-slate-100 font-mono text-xs"
               />
             </div>

             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">URL Gambar (Opsional)</Label>
               <Input 
                placeholder="https://example.com/badge.png" 
                value={formData.imageUrl} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, imageUrl: e.target.value})}
                className="h-12 rounded-xl border-slate-100"
               />
             </div>

             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Poin Dibutuhkan</Label>
               <Input 
                type="number"
                placeholder="0" 
                value={formData.pointsRequired} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, pointsRequired: e.target.value})}
                className="h-12 rounded-xl border-slate-100"
               />
             </div>

             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deskripsi</Label>
               <Textarea 
                placeholder="Jelaskan bagaimana cara mendapatkan badge ini..." 
                value={formData.description} 
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, description: e.target.value})}
                className="rounded-xl border-slate-100 resize-none h-24"
               />
             </div>

             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</Label>
               <select 
                value={formData.status} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: Number(e.target.value)})}
                className="w-full h-12 rounded-xl border border-slate-100 px-3 bg-white text-sm font-medium outline-none"
               >
                 <option value={1}>Aktif (Bisa Didapat)</option>
                 <option value={0}>Nonaktif (Hidden)</option>
               </select>
             </div>
          </div>

          <SheetFooter className="mt-10 pb-10">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black shadow-lg shadow-indigo-100"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Simpan Badge
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}

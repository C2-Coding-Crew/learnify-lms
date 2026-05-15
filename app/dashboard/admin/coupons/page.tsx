"use client";

import React, { useState, useEffect } from "react";
import { 
  Tag, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  Percent, 
  Users,
  Loader2,
  MoreVertical,
  CheckCircle,
  XCircle
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

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    code: "",
    discountPercent: "",
    maxUses: "100",
    validUntil: "",
    status: 1
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const json = await res.json();
      if (Array.isArray(json)) {
        setCoupons(json);
      } else {
        setCoupons([]);
        if (json.error) toast.error(json.error);
      }
    } catch (err) {
      console.error(err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: 0, code: "", discountPercent: "", maxUses: "100", validUntil: "", status: 1 });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setIsEditing(true);
    setFormData({
      id: c.id,
      code: c.code,
      discountPercent: c.discountPercent.toString(),
      maxUses: c.maxUses.toString(),
      validUntil: new Date(c.validUntil).toISOString().split('T')[0],
      status: c.status
    });
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discountPercent || !formData.validUntil) {
      toast.error("Harap lengkapi semua field wajib.");
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditing ? `/api/admin/coupons/${formData.id}` : "/api/admin/coupons";
      const method = isEditing ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Gagal menyimpan kupon");
      
      toast.success(isEditing ? "Kupon diperbarui" : "Kupon ditambahkan");
      setIsSheetOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kupon ini?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus kupon");
      toast.success("Kupon dihapus");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = coupons.filter(c => c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Coupon Management 🏷️
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Kelola kode diskon untuk meningkatkan konversi penjualan.
          </p>
        </div>
        <Button 
          onClick={handleOpenAdd}
          className="h-12 px-6 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-2xl font-black shadow-lg shadow-orange-100 flex items-center gap-2"
        >
          <Plus size={18} /> Buat Kupon Baru
        </Button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
        <div className="relative w-full md:w-96 mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari kode kupon..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all"
          />
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#FF6B4A]" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
             <Tag size={48} className="text-slate-100 mb-2" />
             <p className="text-slate-400 font-bold">Belum ada kupon.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="text-left pb-3 pl-4">Kode Kupon</th>
                    <th className="text-left pb-3">Diskon</th>
                    <th className="text-left pb-3">Penggunaan</th>
                    <th className="text-left pb-3">Berlaku S/D</th>
                    <th className="text-center pb-3">Status</th>
                    <th className="text-right pb-3 pr-4">Aksi</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filtered.map(c => (
                   <tr key={c.id} className="group hover:bg-slate-50 transition-colors">
                     <td className="py-3.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-orange-50 text-[#FF6B4A] rounded-xl flex items-center justify-center font-black text-xs uppercase shrink-0">
                            <Tag size={14} />
                          </div>
                          <p className="font-black text-slate-800 uppercase tracking-wider text-xs">{c.code}</p>
                        </div>
                     </td>
                     <td className="py-3.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-green-600">
                          <Percent size={12} /> {c.discountPercent}% OFF
                        </div>
                     </td>
                     <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[10px]">
                          <Users size={12} /> {c.usedCount} / {c.maxUses}
                        </div>
                        <div className="w-20 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                           <div 
                            className="h-full bg-orange-400" 
                            style={{ width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%` }} 
                           />
                        </div>
                     </td>
                     <td className="py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[10px]">
                          <Calendar size={12} /> {new Date(c.validUntil).toLocaleDateString("id-ID", { day:'2-digit', month:'short', year:'numeric' })}
                        </div>
                     </td>
                     <td className="py-3.5">
                        <div className="flex justify-center">
                          {c.status === 1 ? (
                            <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border border-green-100">Aktif</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-400 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-200">Nonaktif</span>
                          )}
                        </div>
                     </td>
                     <td className="py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEdit(c)}
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                           >
                             <Edit2 size={14} />
                           </Button>
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(c.id)}
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                           >
                             <Trash2 size={14} />
                           </Button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white border-none sm:max-w-md w-[90vw] p-8">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-black text-slate-800">
              {isEditing ? "Edit Kupon" : "Kupon Baru"}
            </SheetTitle>
            <SheetDescription className="text-slate-400 font-medium">
              Konfigurasi detail diskon dan masa berlaku kupon.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kode Kupon</Label>
               <Input 
                placeholder="CONTOH: DISKON50" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})}
                className="h-12 rounded-xl border-slate-100 uppercase"
               />
             </div>
             
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Persen Diskon (%)</Label>
                 <Input 
                  type="number" 
                  placeholder="50" 
                  value={formData.discountPercent} 
                  onChange={e => setFormData({...formData, discountPercent: e.target.value})}
                  className="h-12 rounded-xl border-slate-100"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Maks Penggunaan</Label>
                 <Input 
                  type="number" 
                  placeholder="100" 
                  value={formData.maxUses} 
                  onChange={e => setFormData({...formData, maxUses: e.target.value})}
                  className="h-12 rounded-xl border-slate-100"
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Berlaku Sampai</Label>
               <Input 
                type="date" 
                value={formData.validUntil} 
                onChange={e => setFormData({...formData, validUntil: e.target.value})}
                className="h-12 rounded-xl border-slate-100"
               />
             </div>

             <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</Label>
               <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: Number(e.target.value)})}
                className="w-full h-12 rounded-xl border border-slate-100 px-3 bg-white text-sm font-medium outline-none"
               >
                 <option value={1}>Aktif (Dapat Digunakan)</option>
                 <option value={0}>Nonaktif (Ditangguhkan)</option>
               </select>
             </div>
          </div>

          <SheetFooter className="mt-10">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-black shadow-lg shadow-orange-100"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              Simpan Kupon
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </main>
  );
}

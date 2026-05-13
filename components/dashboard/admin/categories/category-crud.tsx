"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2, Tag, Link as LinkIcon, ShieldCheck, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

interface Category {
  id: number;
  name: string;
  slug: string;
  status: number;
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

export default function CategoryCRUD({ initialData }: { initialData: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Form State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: "", slug: "", status: 1 });

  // Delete Confirm State
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: 0, name: "", slug: "", status: 1 });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setIsEditing(true);
    setFormData({ id: cat.id, name: cat.name, slug: cat.slug, status: cat.status });
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Validasi Gagal", "Nama dan Slug wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing
        ? `/api/admin/categories/${formData.id}`
        : `/api/admin/categories`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      toast.success(
        isEditing ? "Kategori Diperbarui" : "Kategori Ditambahkan",
        isEditing
          ? `Kategori ${formData.name} berhasil diperbarui.`
          : `Kategori ${formData.name} berhasil dibuat.`
      );
      setIsSheetOpen(false);
      router.refresh(); 
      
      if (isEditing) {
        setCategories(categories.map(c => c.id === data.category.id ? {
          ...c, 
          ...data.category,
          lastUpdatedDate: new Date().toISOString() 
        } : c));
      } else {
        setCategories([
          {
            ...data.category,
            createdDate: new Date().toISOString(),
            lastUpdatedDate: new Date().toISOString()
          },
          ...categories
        ]);
      }
    } catch (error: any) {
      toast.error("Gagal Menyimpan", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    const cat = confirmDelete;
    setConfirmDelete(null);
    setLoadingId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus kategori");
      
      toast.success("Kategori Dihapus", `Kategori ${cat.name} telah dihapus dari sistem.`);
      setCategories(categories.filter(c => c.id !== cat.id));
      router.refresh();
    } catch (error: any) {
      toast.error("Gagal", error.message);
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

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-[#FF6B4A] transition-colors" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-700"
          />
        </div>
        <Button
          onClick={handleOpenAdd}
          className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-2xl px-8 py-7 font-black shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Buat Kategori Baru
        </Button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm whitespace-nowrap min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-6 pl-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f1f5f9]">
                Aksi
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Kategori Utama
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Audit (Created)
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Audit (Updated)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      <Tag className="w-10 h-10" />
                    </div>
                    <p className="font-black text-lg text-slate-400">Belum Ada Kategori</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-orange-50/20 transition-all group">
                  <td className="py-5 pl-4 pr-6 sticky left-0 bg-white group-hover:bg-orange-50/20 shadow-[1px_0_0_0_#f1f5f9] transition-colors z-10">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-xl text-blue-500 bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all active:scale-90"
                        onClick={() => handleOpenEdit(cat)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="h-9 w-9 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90"
                        onClick={() => setConfirmDelete(cat)}
                        disabled={loadingId === cat.id}
                      >
                        {loadingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                  
                  <td className="py-5 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border border-orange-200">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[15px]">{cat.name}</span>
                        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">/{cat.slug}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-5 pl-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md w-fit mb-1 border border-slate-100">
                        {cat.createdBy || "SYSTEM"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDate(cat.createdDate)}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 pl-6 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md w-fit mb-1 border border-slate-100">
                        {cat.lastUpdatedBy || "SYSTEM"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDate(cat.lastUpdatedDate)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Form (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white border-l-slate-100 sm:max-w-md w-[90vw] p-0 flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <SheetHeader className="text-left">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <Box className="w-7 h-7 text-[#FF6B4A]" />
              </div>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {isEditing ? "Edit Kategori" : "Buat Kategori Baru"}
              </SheetTitle>
              <SheetDescription className="text-slate-500 font-medium leading-relaxed mt-2">
                Kategori membantu siswa menemukan kursus yang sesuai dengan minat mereka.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Nama */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} className="text-[#FF6B4A]" /> Nama Kategori
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                  setFormData({ ...formData, name, slug });
                }}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-700"
                placeholder="Contoh: Web Development"
              />
            </div>
            
            {/* Slug */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <LinkIcon size={12} className="text-[#FF6B4A]" /> Slug URL
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-700"
                placeholder="web-development"
              />
              <p className="text-[10px] text-slate-400 font-medium italic">Slug digunakan sebagai identitas unik pada URL.</p>
            </div>
            
            {/* Status */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-[#FF6B4A]" /> Status Publikasi
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 1 })}
                  className={`px-4 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                    formData.status === 1 
                    ? "bg-green-50 border-green-500 text-green-700 shadow-md shadow-green-100" 
                    : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  PUBLISH
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 0 })}
                  className={`px-4 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                    formData.status === 0 
                    ? "bg-slate-100 border-slate-400 text-slate-500 shadow-md shadow-slate-100" 
                    : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  ARCHIVE
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-slate-50 bg-slate-50/50">
            <SheetFooter className="flex-row gap-3">
              <Button
                variant="ghost"
                onClick={() => setIsSheetOpen(false)}
                className="flex-1 rounded-2xl font-black text-slate-400 h-14 hover:bg-slate-100"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-[2] bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-2xl font-black h-14 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Simpan Kategori
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirmed}
        isLoading={!!loadingId}
        variant="danger"
        title="Hapus Kategori?"
        description={`Kategori ${confirmDelete?.name} akan dihapus secara permanen. Pastikan tidak ada kursus yang masih menggunakan kategori ini.`}
        confirmLabel="Ya, Hapus"
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Form State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: 0, name: "", slug: "", status: 1 });

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
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
    if (!formData.name || !formData.slug) {
      toast.error("Validasi Gagal", { description: "Nama dan Slug wajib diisi." });
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

      toast.success("Berhasil", { description: `Kategori berhasil ${isEditing ? "diperbarui" : "ditambahkan"}` });
      setIsSheetOpen(false);
      router.refresh(); // memicu re-fetch di server component
      
      // Update local state for immediate feedback
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
      toast.error("Gagal", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (confirmDeleteId === null) return;
    const id = confirmDeleteId;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus kategori");
      
      toast.success("Berhasil", { description: "Kategori telah dihapus" });
      setCategories(categories.filter(c => c.id !== id));
      router.refresh();
      setConfirmDeleteId(null);
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
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

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
          />
        </div>
        <Button
          onClick={handleOpenAdd}
          className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-2xl px-6 py-6 font-bold shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Kategori
        </Button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm whitespace-nowrap min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f1f5f9]">
                Aksi
              </th>
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Kategori Utama
              </th>
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Created By
              </th>
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Created Date
              </th>
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Last Update By
              </th>
              <th className="text-left pb-4 pl-4 pr-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Last Update Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  Tidak ada data kategori yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Aksi di kiri */}
                  <td className="py-4 pl-4 pr-6 sticky left-0 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#f1f5f9] transition-colors z-10">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-blue-500 border-blue-100 hover:bg-blue-50"
                        onClick={() => handleOpenEdit(cat)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 border-red-100 hover:bg-red-50"
                        onClick={() => setConfirmDeleteId(cat.id)}
                        disabled={loadingId === cat.id}
                      >
                        {loadingId === cat.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                  
                  {/* Data Utama */}
                  <td className="py-4 pl-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800">{cat.name}</span>
                      <span className="text-xs text-slate-400 font-medium">/{cat.slug}</span>
                    </div>
                  </td>

                  {/* 4 Field Standar */}
                  <td className="py-4 pl-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                      {cat.createdBy}
                    </span>
                  </td>
                  <td className="py-4 pl-4 text-slate-500 font-medium text-xs">
                    {formatDate(cat.createdDate)}
                  </td>
                  <td className="py-4 pl-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                      {cat.lastUpdatedBy}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-4 text-slate-500 font-medium text-xs">
                    {formatDate(cat.lastUpdatedDate)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal PopUp Form */}
      <Modal
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
        description="Isi detail kategori di bawah ini. Pastikan slug unik."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Nama Kategori</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                // Auto-generate slug
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                setFormData({ ...formData, name, slug });
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
              placeholder="Contoh: Web Development"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium text-slate-500"
              placeholder="web-development"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
            >
              <option value={1}>Aktif</option>
              <option value={0}>Tidak Aktif</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsSheetOpen(false)}
              className="flex-1 rounded-xl font-bold h-12"
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 h-12 bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Simpan Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirmed}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."
        variant="danger"
        isLoading={loadingId !== null && loadingId === confirmDeleteId}
      />
    </div>
  );
}

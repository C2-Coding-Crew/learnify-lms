"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2, User, Mail, ShieldCheck, Briefcase, Award } from "lucide-react";
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

interface InstructorRow {
  id: string;
  name: string;
  email: string;
  totalCourses: number;
  totalStudents: number;
  status: number; // 1 active, 0 inactive
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

export default function InstructorCRUD({ initialData }: { initialData: InstructorRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [instructors, setInstructors] = useState<InstructorRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", status: 1 });

  // Delete Confirm State
  const [confirmDelete, setConfirmDelete] = useState<InstructorRow | null>(null);

  const filteredInstructors = instructors.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", email: "", status: 1 });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (inst: InstructorRow) => {
    setIsEditing(true);
    setFormData({ id: inst.id, name: inst.name, email: inst.email, status: inst.status });
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Validasi Gagal", "Nama dan Email wajib diisi.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Validasi Gagal", "Format email tidak valid.");
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing ? `/api/admin/users/${formData.id}` : `/api/admin/users`;
      const method = isEditing ? "PATCH" : "POST";
      const payload = isEditing ? formData : { ...formData, roleId: 2 };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      toast.success(
        isEditing ? "Data Diperbarui" : "Instruktur Berhasil Didaftarkan",
        isEditing
          ? `Profil ${formData.name} berhasil diperbarui.`
          : `${formData.name} kini resmi menjadi instruktur di Learnify.`
      );
      setIsSheetOpen(false);
      router.refresh();

      if (isEditing) {
        setInstructors(instructors.map((i) =>
          i.id === data.user.id
            ? { ...i, ...data.user, lastUpdatedDate: new Date().toISOString() }
            : i
        ));
      } else {
        setInstructors([
          {
            ...data.user,
            totalCourses: 0,
            totalStudents: 0,
            createdDate: new Date().toISOString(),
            lastUpdatedDate: new Date().toISOString(),
          },
          ...instructors,
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
    const inst = confirmDelete;
    setConfirmDelete(null);
    setLoadingId(inst.id);
    try {
      const res = await fetch(`/api/admin/users/${inst.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menonaktifkan instruktur");

      toast.success("Akses Dicabut", `Akses instruktur ${inst.name} telah dicabut.`);
      setInstructors(instructors.filter((i) => i.id !== inst.id));
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
            placeholder="Cari instruktur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-700"
          />
        </div>
        <Button
          onClick={handleOpenAdd}
          className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-2xl px-8 py-7 font-black shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Daftarkan Instruktur
        </Button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm whitespace-nowrap min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-6 pl-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f1f5f9]">
                Control
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Instruktur Profil
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Portofolio & Status
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
            {filteredInstructors.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                   <div className="flex flex-col items-center gap-4 text-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10" />
                    </div>
                    <p className="font-black text-lg text-slate-400">Instruktur Tidak Ditemukan</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInstructors.map((inst) => (
                <tr key={inst.id} className="hover:bg-orange-50/20 transition-all group">
                  <td className="py-5 pl-4 pr-6 sticky left-0 bg-white group-hover:bg-orange-50/20 shadow-[1px_0_0_0_#f1f5f9] transition-colors z-10">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-xl text-blue-500 bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all active:scale-90"
                        onClick={() => handleOpenEdit(inst)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="h-9 w-9 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90"
                        onClick={() => setConfirmDelete(inst)}
                        disabled={loadingId === inst.id}
                      >
                        {loadingId === inst.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="py-5 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-100">
                        {inst.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[15px]">{inst.name}</span>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                          <Mail size={10} /> {inst.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-5 pl-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">
                           <Award size={10} /> {inst.totalCourses} Kelas
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-lg border border-purple-100">
                           <User size={10} /> {inst.totalStudents} Siswa
                        </span>
                      </div>
                      <span className={`text-[9px] w-fit font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-2 ${
                        inst.status === 1 
                        ? "bg-green-50 text-green-600 border-green-100" 
                        : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                        {inst.status === 1 ? "● Active Partner" : "○ Inactive"}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 pl-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md w-fit mb-1 border border-slate-100">
                        {inst.createdBy || "SYSTEM"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDate(inst.createdDate)}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 pl-6 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md w-fit mb-1 border border-slate-100">
                        {inst.lastUpdatedBy || "SYSTEM"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDate(inst.lastUpdatedDate)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="bg-white border-l-slate-100 sm:max-w-md w-[90vw] p-0 flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <SheetHeader className="text-left">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <Briefcase className="w-7 h-7 text-indigo-600" />
              </div>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {isEditing ? "Update Profil Instruktur" : "Tambah Instruktur Baru"}
              </SheetTitle>
              <SheetDescription className="text-slate-500 font-medium leading-relaxed mt-2">
                Instruktur memiliki akses untuk mengunggah materi kelas dan mengelola kurikulum mereka sendiri.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Input Nama */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} className="text-indigo-600" /> Nama Mentor
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold text-slate-700"
                placeholder="Contoh: Andi Saputra"
              />
            </div>

            {/* Input Email */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-indigo-600" /> Email Resmi
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isEditing}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold text-slate-700 disabled:opacity-50 disabled:bg-slate-100/50"
                placeholder="andi@learnify.id"
              />
            </div>

            {/* Status */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-indigo-600" /> Kemitraan Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 1 })}
                  className={`px-4 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                    formData.status === 1 
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md shadow-indigo-100" 
                    : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  AKTIF
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 0 })}
                  className={`px-4 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                    formData.status === 0 
                    ? "bg-red-50 border-red-500 text-red-700 shadow-md shadow-red-100" 
                    : "bg-white border-slate-100 text-slate-400"
                  }`}
                >
                  INAKTIF
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
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black h-14 shadow-lg shadow-indigo-500/20 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {isEditing ? "Update Mentor" : "Simpan Data Mentor"}
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
        title="Cabut Akses Instruktur?"
        description={`Instruktur ${confirmDelete?.name} tidak akan bisa lagi mengakses panel dashboard dan mengelola kursus mereka.`}
        confirmLabel="Ya, Cabut Akses"
      />
    </div>
  );
}

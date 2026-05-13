"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2, User, Mail, ShieldCheck, GraduationCap } from "lucide-react";
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

interface StudentRow {
  id: string;
  name: string;
  email: string;
  enrolled: number;
  completed: number;
  status: number; // 1 active, 0 inactive
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

export default function StudentCRUD({ initialData }: { initialData: StudentRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [students, setStudents] = useState<StudentRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Form State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", status: 1 });

  // Delete Confirm State
  const [confirmDelete, setConfirmDelete] = useState<StudentRow | null>(null);

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", email: "", status: 1 });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (student: StudentRow) => {
    setIsEditing(true);
    setFormData({ id: student.id, name: student.name, email: student.email, status: student.status });
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
      const payload = isEditing ? formData : { ...formData, roleId: 3 };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      toast.success(
        isEditing ? "Data Diperbarui" : "Siswa Ditambahkan",
        isEditing
          ? `Data ${formData.name} berhasil diperbarui.`
          : `${formData.name} berhasil didaftarkan sebagai siswa.`
      );
      setIsSheetOpen(false);
      router.refresh();

      // Optimistic update
      if (isEditing) {
        setStudents(students.map((s) =>
          s.id === data.user.id
            ? { ...s, ...data.user, lastUpdatedDate: new Date().toISOString() }
            : s
        ));
      } else {
        setStudents([
          {
            ...data.user,
            enrolled: 0,
            completed: 0,
            createdDate: new Date().toISOString(),
            lastUpdatedDate: new Date().toISOString(),
          },
          ...students,
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
    const student = confirmDelete;
    setConfirmDelete(null);
    setLoadingId(student.id);
    try {
      const res = await fetch(`/api/admin/users/${student.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menonaktifkan siswa");

      toast.success("Akun Dinonaktifkan", `${student.name} telah dinonaktifkan dari platform.`);
      setStudents(students.filter((s) => s.id !== student.id));
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
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <Button
          onClick={handleOpenAdd}
          className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-2xl px-8 py-7 font-black shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Siswa Baru
        </Button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm whitespace-nowrap min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-6 pl-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px] sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f1f5f9]">
                Aksi Control
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Profil Siswa
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Status & Progress
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Audit Logs (Created)
              </th>
              <th className="text-left pb-6 pl-6 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                Audit Logs (Updated)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                      <Search className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-black text-lg text-slate-400">Tidak Ada Data</p>
                      <p className="text-xs font-bold">Coba cari dengan kata kunci lain.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-orange-50/20 transition-all group">
                  {/* Aksi */}
                  <td className="py-5 pl-4 pr-6 sticky left-0 bg-white group-hover:bg-orange-50/20 shadow-[1px_0_0_0_#f1f5f9] transition-colors z-10">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-9 w-9 rounded-xl text-blue-500 bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all active:scale-90"
                        onClick={() => handleOpenEdit(student)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="h-9 w-9 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90"
                        onClick={() => setConfirmDelete(student)}
                        disabled={loadingId === student.id}
                      >
                        {loadingId === student.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Profil */}
                  <td className="py-5 pl-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-[#FF6B4A] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg shadow-orange-100">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-[15px]">{student.name}</span>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                          <Mail size={10} /> {student.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status & Progress */}
                  <td className="py-5 pl-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={`text-[9px] w-fit font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border-2 ${
                        student.status === 1 
                        ? "bg-green-50 text-green-600 border-green-100" 
                        : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                        {student.status === 1 ? "● Active Student" : "○ Deactivated"}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#FF6B4A] rounded-full" 
                            style={{ width: `${student.enrolled > 0 ? (student.completed / student.enrolled) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-black">
                          {student.completed}/{student.enrolled}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Created Audit */}
                  <td className="py-5 pl-6">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md w-fit mb-1 border border-slate-100">
                        {student.createdBy || "SYSTEM"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDate(student.createdDate)}
                      </span>
                    </div>
                  </td>

                  {/* Updated Audit */}
                  <td className="py-5 pl-6 pr-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md w-fit mb-1 border border-slate-100">
                        {student.lastUpdatedBy || "SYSTEM"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {formatDate(student.lastUpdatedDate)}
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
        <SheetContent className="bg-white border-l-slate-100 sm:max-w-md w-[90vw] p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <SheetHeader className="text-left">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <GraduationCap className="w-7 h-7 text-[#FF6B4A]" />
              </div>
              <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {isEditing ? "Update Data Siswa" : "Registrasi Siswa Baru"}
              </SheetTitle>
              <SheetDescription className="text-slate-500 font-medium leading-relaxed mt-2">
                {isEditing
                  ? "Pastikan data yang diubah sudah sesuai dengan identitas siswa yang bersangkutan."
                  : "Daftarkan akun siswa baru ke dalam platform Learnify. Password akan diatur oleh siswa secara mandiri."}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Input Nama */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} className="text-[#FF6B4A]" /> Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-700"
                placeholder="Contoh: Muhammad Budi"
              />
              <p className="text-[10px] text-slate-400 font-medium">Nama akan ditampilkan di sertifikat kelulusan.</p>
            </div>

            {/* Input Email */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Mail size={12} className="text-[#FF6B4A]" /> Alamat Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isEditing}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100/50"
                placeholder="budi@example.com"
              />
              {isEditing ? (
                <p className="text-[10px] text-orange-500 font-bold flex items-center gap-1">
                   Email tidak dapat diubah demi keamanan akun.
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 font-medium">Gunakan email aktif siswa untuk verifikasi.</p>
              )}
            </div>

            {/* Input Status */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-[#FF6B4A]" /> Status Akses
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: 1 })}
                  className={`px-4 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                    formData.status === 1 
                    ? "bg-green-50 border-green-500 text-green-700 shadow-md shadow-green-100" 
                    : "bg-white border-slate-100 text-slate-400 grayscale"
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
                    : "bg-white border-slate-100 text-slate-400 grayscale"
                  }`}
                >
                  BLOKIR
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
                {isEditing ? "Simpan Perubahan" : "Konfirmasi & Daftar"}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirmed}
        isLoading={!!loadingId}
        variant="warning"
        title="Nonaktifkan Akun Siswa?"
        description={`Akun ${confirmDelete?.name ?? "siswa ini"} akan dinonaktifkan. Mereka tidak akan bisa login hingga diaktifkan kembali oleh admin.`}
        confirmLabel="Ya, Nonaktifkan Akun"
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [students, setStudents] = useState<StudentRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", email: "", status: 1 });

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
    if (!formData.name || !formData.email) {
      toast.error("Validasi Gagal", { description: "Nama dan Email wajib diisi." });
      return;
    }

    setIsLoading(true);
    try {
      const url = isEditing
        ? `/api/admin/users/${formData.id}`
        : `/api/admin/users`;
      const method = isEditing ? "PATCH" : "POST";
      
      const payload = isEditing ? formData : { ...formData, roleId: 3 };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      toast.success("Berhasil", { description: `Siswa berhasil ${isEditing ? "diperbarui" : "ditambahkan"}` });
      setIsSheetOpen(false);
      router.refresh(); 

      // Optimistic update
      if (isEditing) {
        setStudents(students.map(s => s.id === data.user.id ? {
          ...s, 
          ...data.user,
          lastUpdatedDate: new Date().toISOString() 
        } : s));
      } else {
        setStudents([
          {
            ...data.user,
            enrolled: 0,
            completed: 0,
            createdDate: new Date().toISOString(),
            lastUpdatedDate: new Date().toISOString()
          },
          ...students
        ]);
      }
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menonaktifkan siswa");
      
      toast.success("Berhasil", { description: "Siswa telah dinonaktifkan" });
      setStudents(students.filter(s => s.id !== id));
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
    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
          />
        </div>
        <Button
          onClick={handleOpenAdd}
          className="w-full md:w-auto bg-[#FF6B4A] hover:bg-[#E55A3B] text-white rounded-2xl px-6 py-6 font-bold shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-5 h-5 mr-2" /> Tambah Siswa
        </Button>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm whitespace-nowrap min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-3 pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-white z-10 shadow-[1px_0_0_0_#f1f5f9]">
                Aksi
              </th>
              <th className="text-left pb-3 pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Profil Siswa
              </th>
              <th className="text-left pb-3 pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Status / Progress
              </th>
              <th className="text-left pb-3 pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Created By
              </th>
              <th className="text-left pb-3 pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Created Date
              </th>
              <th className="text-left pb-3 pl-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Last Update By
              </th>
              <th className="text-left pb-3 pl-3 pr-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Last Update Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                  Tidak ada data siswa yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Aksi di kiri */}
                  <td className="py-3 pl-3 pr-4 sticky left-0 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_#f1f5f9] transition-colors z-10">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-blue-500 border-blue-100 hover:bg-blue-50"
                        onClick={() => handleOpenEdit(student)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 border-red-100 hover:bg-red-50"
                        onClick={() => setConfirmDeleteId(student.id)}
                        disabled={loadingId === student.id}
                      >
                        {loadingId === student.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </td>
                  
                  {/* Data Utama */}
                  <td className="py-3 pl-3">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-xs">{student.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{student.email}</span>
                    </div>
                  </td>

                  <td className="py-3 pl-3">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[9px] w-fit font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                        student.status === 1 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`}>
                        {student.status === 1 ? "Aktif" : "Non-Aktif"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold">
                        {student.completed}/{student.enrolled} Selesai
                      </span>
                    </div>
                  </td>

                  {/* 4 Field Standar */}
                  <td className="py-3 pl-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {student.createdBy || "SYSTEM"}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-slate-500 font-medium text-[10px]">
                    {formatDate(student.createdDate)}
                  </td>
                  <td className="py-3 pl-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {student.lastUpdatedBy || "SYSTEM"}
                    </span>
                  </td>
                  <td className="py-3 pl-3 pr-4 text-slate-500 font-medium text-[10px]">
                    {formatDate(student.lastUpdatedDate)}
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
        title={isEditing ? "Edit Siswa" : "Tambah Siswa Baru"}
        description={
          isEditing
            ? "Ubah data profil siswa di bawah ini."
            : "Buat akun siswa secara manual tanpa password. (Siswa dapat login menggunakan akun Google)"
        }
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
              placeholder="Contoh: John Doe"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Email Utama</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium text-slate-500"
              placeholder="john@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Status Akun</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
            >
              <option value={1}>Aktif (Diizinkan Login)</option>
              <option value={0}>Non-Aktif (Diblokir)</option>
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
        title="Nonaktifkan Akun Siswa"
        description="Apakah Anda yakin ingin menonaktifkan akun siswa ini? Mereka tidak akan bisa login ke platform."
        variant="warning"
        isLoading={loadingId !== null && loadingId === confirmDeleteId}
      />
    </div>
  );
}

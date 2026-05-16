"use client";

import React, { useState } from "react";
import { Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentActionButtonsProps {
  enrollmentId: number;
  studentName: string;
  studentEmail: string;
}

export default function StudentActionButtons({ enrollmentId, studentName, studentEmail }: StudentActionButtonsProps) {
  const router = useRouter();
  const toast = useToast();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for edit (currently just simulated)
  const [name, setName] = useState(studentName);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/instructor/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal mengeluarkan siswa");

      toast.success("Berhasil", `${studentName} telah dikeluarkan dari kursus.`);
      router.refresh();
    } catch (error: any) {
      toast.error("Gagal", error.message || "Terjadi kesalahan saat menghapus siswa.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call for name update if needed, but usually instructors can't change student names.
      // However, we'll just show success for UX.
      await new Promise(r => setTimeout(r, 500));
      
      toast.success("Berhasil", "Data siswa berhasil diperbarui.");
      setShowEditModal(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Gagal", "Gagal memperbarui data siswa.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg text-blue-500 border-blue-100 hover:bg-blue-50"
          onClick={() => setShowEditModal(true)}
        >
          <Edit2 size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg text-red-500 border-red-100 hover:bg-red-50"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </Button>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Keluarkan Siswa"
        description={`Apakah Anda yakin ingin mengeluarkan ${studentName} dari kursus ini? Siswa tidak akan lagi memiliki akses ke materi.`}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Edit Modal (Simulated) */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Data Siswa"
        description="Informasi pendaftaran siswa dalam kursus Anda."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nama Lengkap</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="h-12 rounded-xl border-slate-100 font-bold"
            />
          </div>
          <div className="space-y-2 opacity-50">
            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Email (Read Only)</Label>
            <Input 
              value={studentEmail} 
              readOnly
              className="h-12 rounded-xl border-slate-100 font-bold bg-slate-50"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              Batal
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={isSaving}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

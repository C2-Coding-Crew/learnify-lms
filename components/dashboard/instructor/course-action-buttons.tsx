"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Edit, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface CourseActionButtonsProps {
  courseId: number;
  courseSlug: string;
}

export default function CourseActionButtons({ courseId, courseSlug }: CourseActionButtonsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Berhasil", {
        description: "Kelas berhasil dihapus.",
      });
      
      router.refresh(); // Refresh the page to remove the deleted course
    } catch (error) {
      console.error("[DELETE_COURSE_ERROR]", error);
      toast.error("Gagal", {
        description: "Terjadi kesalahan saat menghapus kelas.",
      });
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <div className="p-2 border-t border-slate-50 bg-slate-50/50 flex gap-2">
        <Link 
          href={`/courses/${courseSlug}`} 
          className="flex-1 flex justify-center py-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
          title="Lihat Detail Kelas"
        >
          <Eye size={18} />
        </Link>
        <Link 
          href={`/dashboard/instructor/courses/${courseId}/edit`} 
          className="flex-1 flex justify-center py-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
          title="Edit Kelas"
        >
          <Edit size={18} />
        </Link>
        <button 
          onClick={() => setShowConfirmDialog(true)}
          disabled={isDeleting}
          className="flex-1 flex justify-center py-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
          title="Hapus Kelas"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <ConfirmDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Kelas Ini?"
        description="Kelas yang dihapus akan ditarik dari peredaran. Siswa yang sudah membeli tetap dapat mengaksesnya."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
      />
    </>
  );
}

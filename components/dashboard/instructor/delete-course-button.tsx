"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteCourseButtonProps {
  courseId: number;
  courseTitle: string;
}

export default function DeleteCourseButton({ courseId, courseTitle }: DeleteCourseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Berhasil", { description: "Kursus telah dihapus." });
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Gagal", { description: error.message || "Terjadi kesalahan." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex-1 flex justify-center py-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6 border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle size={24} />
          </div>
          <DialogTitle className="text-xl font-black text-slate-800">
            Hapus Kursus?
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm font-medium">
            Anda yakin ingin menghapus kursus{" "}
            <span className="font-bold text-slate-700">"{courseTitle}"</span>?
            Kursus ini akan diarsipkan (soft delete) dan tidak akan terlihat oleh siswa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl font-bold"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="button"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Ya, Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

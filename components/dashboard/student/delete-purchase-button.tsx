"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function DeletePurchaseButton({ id }: { id: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/student/purchases?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Berhasil menghapus riwayat pembelian");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Gagal menghapus riwayat pembelian");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        title="Hapus Riwayat"
      >
        <Trash2 size={16} />
      </button>

      <ConfirmDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onDelete}
        isLoading={isLoading}
        variant="danger"
        title="Hapus Riwayat Pembelian?"
        description="Tindakan ini akan menghapus riwayat tagihan ini dari daftar Anda. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
      />
    </>
  );
}

"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Landmark, Wallet } from "lucide-react";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess: () => void;
}

export default function WithdrawalModal({ isOpen, onClose, availableBalance, onSuccess }: WithdrawalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    note: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = Number(formData.amount);
    if (!amountNum || amountNum < 50000) {
      toast.error("Minimal penarikan Rp 50.000");
      return;
    }
    if (amountNum > availableBalance) {
      toast.error("Saldo tidak mencukupi");
      return;
    }
    if (!formData.bankName || !formData.accountNumber || !formData.accountName) {
      toast.error("Harap lengkapi data rekening");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/instructor/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: amountNum
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengajukan penarikan");

      toast.success("Pengajuan penarikan berhasil dikirim!");
      onSuccess();
      onClose();
      setFormData({ amount: "", bankName: "", accountNumber: "", accountName: "", note: "" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-none rounded-[2rem] p-8 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Wallet className="text-[#FF6B4A]" /> Tarik Dana
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Dana akan diproses dalam 1-3 hari kerja ke rekening Anda.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Saldo Tersedia</p>
              <p className="text-xl font-black text-orange-600">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(availableBalance)}
              </p>
            </div>
            <Landmark className="text-orange-200" size={32} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Penarikan (IDR)</Label>
            <Input 
              type="number" 
              placeholder="Min. 50.000"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="h-12 rounded-xl border-slate-100 focus:ring-[#FF6B4A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Bank</Label>
              <Input 
                placeholder="BCA, Mandiri, dll"
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                className="h-12 rounded-xl border-slate-100 focus:ring-[#FF6B4A]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nomor Rekening</Label>
              <Input 
                placeholder="000-000-000"
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                className="h-12 rounded-xl border-slate-100 focus:ring-[#FF6B4A]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Pemilik Rekening</Label>
            <Input 
              placeholder="Sesuai buku tabungan"
              value={formData.accountName}
              onChange={(e) => setFormData({...formData, accountName: e.target.value})}
              className="h-12 rounded-xl border-slate-100 focus:ring-[#FF6B4A]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan (Opsional)</Label>
            <Textarea 
              placeholder="Pesan tambahan untuk admin..."
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              className="rounded-xl border-slate-100 focus:ring-[#FF6B4A] resize-none"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-xl font-bold"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl px-8 font-black shadow-lg shadow-orange-100"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Ajukan Sekarang
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

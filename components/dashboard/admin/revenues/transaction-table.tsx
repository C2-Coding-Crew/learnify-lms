"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  course: string;
  instructor: string;
  studentName: string;
  amount: string;
  date: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  totalTransactions: number;
}

export default function TransactionTable({ transactions, page, totalPages, totalTransactions }: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-black text-[#2D2D2D] text-lg">Full Transaction History</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">Total {totalTransactions} transaksi ditemukan</p>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">No. Invoice / Kursus</th>
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Siswa</th>
              <th className="text-left pb-4 pl-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
              <th className="text-right pb-4 pr-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400 font-medium">
                  Belum ada transaksi pada periode ini.
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-4">
                    <p className="font-bold text-[#2D2D2D] truncate max-w-[250px]">{t.course}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Instruktur: {t.instructor}</p>
                  </td>
                  <td className="py-4 pl-4">
                    <span className="font-medium text-slate-700">{t.studentName}</span>
                  </td>
                  <td className="py-4 pl-4 text-slate-500 text-xs font-medium">
                    {t.date}
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                      {t.amount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DownloadInvoiceButton from "@/components/dashboard/student/download-invoice-button";
import DeletePurchaseButton from "@/components/dashboard/student/delete-purchase-button";
import { Receipt, AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";

export const metadata = {
  title: "Riwayat Pembelian | Learnify",
};

export default async function StudentPurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const invoices = await db.invoice.findMany({
    where: { userId: session.user.id, isDeleted: 0 },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          category: { select: { name: true } },
        }
      }
    },
    orderBy: { createdDate: "desc" }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight flex items-center gap-3">
          <Receipt className="text-orange-500 w-8 h-8" />
          Riwayat Pembelian
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          Kelola semua tagihan dan unduh kwitansi resmi (Invoice) dari pembelian kursus Anda.
        </p>
      </header>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-4 w-[50px] text-center"></th>
                <th className="px-6 py-4">No. Invoice & Tanggal</th>
                <th className="px-6 py-4">Kursus</th>
                <th className="px-6 py-4">Total Nominal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <p className="text-slate-400 font-medium">Belum ada riwayat pembelian.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-center">
                      {inv.invoiceStatus !== "paid" ? (
                        <DeletePurchaseButton id={inv.id} />
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center opacity-20">
                          <Trash2 size={16} className="text-slate-300 cursor-not-allowed" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#2D2D2D]">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">{formatDate(inv.createdDate as Date)}</p>
                    </td>
                    <td className="px-6 py-4">
                      {inv.course ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            {inv.course.category?.name && (
                              <span className="text-[10px] font-black text-[#FF6B4A] bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                {inv.course.category.name}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-700 max-w-[250px] truncate">
                            {inv.course.title}
                          </p>
                          <p className="text-xs text-slate-400 font-medium mt-1">
                            Instruktur: {inv.course.instructor?.name || "—"}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Data kursus tidak tersedia</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-700">
                        {formatCurrency(Number(inv.totalAmount))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.invoiceStatus === "paid" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                        </span>
                      )}
                      {inv.invoiceStatus === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200">
                          <Clock className="w-3.5 h-3.5" /> Menunggu
                        </span>
                      )}
                      {inv.invoiceStatus === "cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Dibatalkan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.invoiceStatus === "paid" ? (
                        <DownloadInvoiceButton 
                          invoice={{
                            invoiceNumber: inv.invoiceNumber,
                            studentName: session.user.name,
                            courseName: inv.course?.title || "Unknown Course",
                            instructorName: inv.course?.instructor?.name || "—",
                            amount: Number(inv.totalAmount),
                            date: formatDate(inv.createdDate as Date),
                            status: "Lunas"
                          }}
                        />
                      ) : inv.invoiceStatus === "pending" ? (
                        <a 
                          href={`/checkout/${inv.invoiceNumber}`}
                          className="inline-flex items-center justify-center h-9 px-4 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                        >
                          Bayar Sekarang
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Tidak Tersedia</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

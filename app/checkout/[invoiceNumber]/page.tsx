import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import CheckoutClient from "@/components/checkout/checkout-client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ invoiceNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { invoiceNumber } = await params;
  return {
    title: `Checkout ${invoiceNumber} — Learnify`,
    description: "Selesaikan pembayaran kursus kamu di Learnify.",
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { invoiceNumber } = await params;

  // Auth guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/checkout/${invoiceNumber}`);
  }

  // Ambil invoice dari DB
  const invoice = await db.invoice.findFirst({
    where: {
      invoiceNumber,
      userId: session.user.id,
      isDeleted: 0,
    },
    include: {
      transactions: {
        select: { transactionStatus: true, paymentType: true },
        orderBy: { createdDate: "desc" },
        take: 1,
      },
    },
  });

  if (!invoice) notFound();

  return (
    <CheckoutClient
      invoice={{
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.totalAmount),
        invoiceStatus: invoice.invoiceStatus,
        dueDate: invoice.dueDate.toISOString(),
      }}
    />
  );
}

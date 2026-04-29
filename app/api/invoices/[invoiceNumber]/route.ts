import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/invoices/[invoiceNumber]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { invoiceNumber } = await params;

  const invoice = await db.invoice.findFirst({
    where: {
      invoiceNumber,
      userId: session.user.id,
      isDeleted: 0,
    },
    include: {
      transactions: {
        select: { transactionStatus: true, paymentType: true, transactionTime: true },
        orderBy: { createdDate: "desc" },
        take: 1,
      },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

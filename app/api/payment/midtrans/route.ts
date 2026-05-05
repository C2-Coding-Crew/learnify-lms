import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// ─── Midtrans Snap Token ──────────────────────────────────────────────────────
// POST /api/payment/midtrans
// Body: { invoiceNumber: string }
// Return: { snapToken: string }
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { invoiceNumber } = body;

  if (!invoiceNumber) {
    return NextResponse.json({ error: "invoiceNumber wajib diisi" }, { status: 400 });
  }

  // Ambil invoice dari DB
  const invoice = await db.invoice.findFirst({
    where: {
      invoiceNumber,
      userId: session.user.id,
      invoiceStatus: "pending",
      isDeleted: 0,
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice tidak ditemukan atau sudah dibayar" }, { status: 404 });
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
  const baseUrl = isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";

  if (!serverKey) {
    return NextResponse.json({ error: "Midtrans server key belum dikonfigurasi" }, { status: 503 });
  }

  const encodedKey = Buffer.from(`${serverKey}:`).toString("base64");

  // Buat Snap transaction ke Midtrans
  const midtransRes = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedKey}`,
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: invoiceNumber,
        gross_amount: Number(invoice.totalAmount),
      },
      customer_details: {
        first_name: invoice.user.name,
        email: invoice.user.email,
      },
      // Callbacks opsional jika ingin redirect otomatis oleh Midtrans
      // Namun kita sudah handle via Snap JS di frontend (onSuccess, dll)
      // Jadi dikosongkan agar tidak terjadi error iframe redirection
      /*
      callbacks: {
        finish: `${process.env.BETTER_AUTH_URL}/checkout/${invoiceNumber}/success`,
        error: `${process.env.BETTER_AUTH_URL}/checkout/${invoiceNumber}/failed`,
        pending: `${process.env.BETTER_AUTH_URL}/checkout/${invoiceNumber}/pending`,
      },
      */
    }),
  });

  if (!midtransRes.ok) {
    const err = await midtransRes.json();
    console.error("[Midtrans]", err);
    return NextResponse.json(
      { error: "Gagal membuat Snap token dari Midtrans", detail: err },
      { status: 502 }
    );
  }

  const { token } = await midtransRes.json();

  return NextResponse.json({ snapToken: token, invoiceNumber });
}

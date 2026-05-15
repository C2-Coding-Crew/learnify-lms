import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const roleId = (session.user as any).roleId;

  if (roleId !== 2) {
    return NextResponse.json({ error: "Only instructors can access this" }, { status: 403 });
  }

  try {
    const withdrawals = await (db as any).withdrawal.findMany({
      where: { instructorId: userId, isDeleted: 0 },
      orderBy: { createdDate: "desc" },
    });

    // Calculate Balance
    const paidInvoices = await db.invoice.findMany({
      where: {
        invoiceStatus: "paid",
        isDeleted: 0,
        course: { instructorId: userId }
      },
      select: { totalAmount: true }
    });

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const instructorShare = totalRevenue * 0.6;

    const totalWithdrawn = withdrawals
      .filter((w: any) => w.status !== "rejected")
      .reduce((sum: number, w: any) => sum + Number(w.amount), 0);

    const availableBalance = instructorShare - totalWithdrawn;

    return NextResponse.json({
      withdrawals,
      stats: {
        totalRevenue,
        instructorShare,
        totalWithdrawn,
        availableBalance: Math.max(0, availableBalance)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const roleId = (session.user as any).roleId;

  if (roleId !== 2) {
    return NextResponse.json({ error: "Only instructors can request withdrawals" }, { status: 403 });
  }

  try {
    const { amount, bankName, accountNumber, accountName, note } = await req.json();

    if (!amount || amount < 50000) {
      return NextResponse.json({ error: "Minimum penarikan adalah Rp 50.000" }, { status: 400 });
    }

    // Double check balance
    const paidInvoices = await db.invoice.findMany({
      where: {
        invoiceStatus: "paid",
        isDeleted: 0,
        course: { instructorId: userId }
      },
      select: { totalAmount: true }
    });

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const instructorShare = totalRevenue * 0.6;

    const existingWithdrawals = await (db as any).withdrawal.findMany({
      where: { instructorId: userId, isDeleted: 0, status: { not: "rejected" } },
      select: { amount: true }
    });

    const totalWithdrawn = existingWithdrawals.reduce((sum: number, w: any) => sum + Number(w.amount), 0);
    const availableBalance = instructorShare - totalWithdrawn;

    if (amount > availableBalance) {
      return NextResponse.json({ error: "Saldo tidak mencukupi" }, { status: 400 });
    }

    const withdrawal = await (db as any).withdrawal.create({
      data: {
        instructorId: userId,
        amount,
        bankName,
        accountNumber,
        accountName,
        note,
        createdBy: session.user.name || "Instructor",
        lastUpdatedBy: session.user.name || "Instructor",
      }
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

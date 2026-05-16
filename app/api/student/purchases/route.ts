import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return new NextResponse("Invoice ID is required", { status: 400 });
    }

    // Hanya izinkan menghapus invoice yang statusnya 'pending' atau 'cancelled'
    // Dan pastikan invoice tersebut milik user yang sedang login
    const invoice = await db.invoice.findFirst({
      where: {
        id: Number(id),
        userId: session.user.id,
      }
    });

    if (!invoice) {
      return new NextResponse("Invoice not found", { status: 404 });
    }

    if (invoice.invoiceStatus === "paid") {
      return new NextResponse("Cannot delete a paid invoice", { status: 400 });
    }

    // Soft delete
    await db.invoice.update({
      where: { id: Number(id) },
      data: { isDeleted: 1 }
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("[PURCHASE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

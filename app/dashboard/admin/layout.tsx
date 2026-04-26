import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AdminLayoutContent from "@/components/dashboard/admin/layout-content";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // ── Cek dan Promosikan Google User ke Admin secara instan ────────────────
  const googleAccount = await db.account.findFirst({
    where: { userId: session.user.id, providerId: "google" }
  });

  if (googleAccount) {
    // Pastikan di DB role-nya sudah 1
    const currentUser = await db.user.findUnique({ where: { id: session.user.id }, select: { roleId: true } });
    if (currentUser?.roleId !== 1) {
      await db.user.update({
        where: { id: session.user.id },
        data: { roleId: 1 }
      });
    }
  } else {
    // Jika bukan Google, cek role seperti biasa
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { roleId: true }
    });

    if (!dbUser || dbUser.roleId !== 1) {
      redirect("/dashboard");
    }
  }

  return (
    <AdminLayoutContent userName={session.user.name}>
      {children}
    </AdminLayoutContent>
  );
}

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

  // Cek database langsung untuk validasi role yang lebih akurat
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { roleId: true }
  });

  if (!dbUser || dbUser.roleId !== 1) {
    redirect("/dashboard");
  }

  return (
    <AdminLayoutContent userName={session.user.name}>
      {children}
    </AdminLayoutContent>
  );
}

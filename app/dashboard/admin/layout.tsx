import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminLayoutContent from "@/components/dashboard/admin/layout-content";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("DEBUG AdminLayout session:", JSON.stringify(session, null, 2));

  if (!session) {
    redirect("/auth/login");
  }

  const roleId = (session.user as any).roleId;
  console.log("DEBUG AdminLayout roleId:", roleId);
  if (roleId !== 1) {
    redirect("/dashboard");
  }

  return (
    <AdminLayoutContent userName={session.user.name}>
      {children}
    </AdminLayoutContent>
  );
}

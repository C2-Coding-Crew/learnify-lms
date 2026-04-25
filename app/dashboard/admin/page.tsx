// app/dashboard/admin/page.tsx
import AdminDashboard from "@/components/dashboard/admin/admin";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/login");

  return (
    <AdminDashboard
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Admin"
      twoFactorEnabled={session.user.twoFactorEnabled ?? false}
    />
  );
}
// app/dashboard/page.tsx
import StudentDashboard from "@/components/dashboard/student/dashboard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

const userRoleData = await db.role.findUnique({
  where: { 
    id: (session.user as any).roleId ?? 2 
  }
});

return (
  <StudentDashboard
    userName={session.user.name}
    userEmail={session.user.email}
    userRole={userRoleData?.name || "student"}
  />
);
}
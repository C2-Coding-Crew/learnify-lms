import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import StudentDashboard from "@/components/dashboard/dashboard";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <StudentDashboard 
      userName={session.user.name} 
      userEmail={session.user.email} 
      twoFactorEnabled={session.user.twoFactorEnabled}
    />
  );
}
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import AnalyticsClient from "@/app/dashboard/instructor/analytics/analytics-client";

export default async function InstructorAnalyticsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/login");

  const roleId = (session.user as any).roleId;
  if (Number(roleId) !== 2) redirect("/dashboard");

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Detailed Analytics 📊" 
        subtitle="Track your growth, revenue, and student engagement."
      />

      <AnalyticsClient />
    </main>
  );
}

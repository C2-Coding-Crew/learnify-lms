import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
// Import UI yang sudah kita buat sebelumnya
import InstructorDashboardContent from "@/components/dashboard/instructor/instructor";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.roleId !== 3) {
    redirect("/");
  }

  return (
    <InstructorDashboardContent 
      userName={session.user.name} 
      userEmail={session.user.email} 
      userRole="Instructor" 
    />
  );
}
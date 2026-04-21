import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardRootPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // 1. Cek Login
    if (!session) {
        redirect("/login");
    }

<<<<<<< HEAD
  return (
    <StudentDashboard 
      userName={session.user.name} 
      userEmail={session.user.email} 
      twoFactorEnabled={session.user.twoFactorEnabled}
    />
  );
=======
    const roleId = session.user.roleId;

    // 2. Arahkan sesuai Role ID (1: Admin, 2: Student, 3: Instructor)
    if (roleId === 1) {
        redirect("/dashboard/admin");
    } else if (roleId === 3) {
        redirect("/dashboard/instructor");
    } else {
        // Default ke Student jika roleId 2 atau lainnya
        redirect("/dashboard/student");
    }
>>>>>>> main
}
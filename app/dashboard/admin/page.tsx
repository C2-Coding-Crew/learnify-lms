// app/dashboard/page.tsx
import StudentDashboard from "@/components/dashboard/student/dashboard";
import InstructorDashboard from "@/components/dashboard/instructor/instructor";
import AdminDashboard from "@/components/dashboard/admin/admin";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/login");

  const userEmail = session.user.email;

  // --- LOGIC HARD-CHECK ADMIN BY EMAIL ---
  // Kamu bisa tambahkan list email admin di sini
  const adminEmails = ["fauziaditya874@gmail.com", "admin@learnify.id"]; 

  if (adminEmails.includes(userEmail)) {
    return (
      <AdminDashboard
        userName={session.user.name}
        userEmail={userEmail}
        userRole="Super Admin"
      />
    );
  }

  // --- LOGIC UNTUK ROLE LAINNYA (Instructor/Student) ---
  const userRoleData = await db.role.findUnique({
    where: { 
      id: (session.user as any).roleId ?? 2 
    }
  });

  const roleName = userRoleData?.name.toLowerCase() || "student";

  if (roleName === "instructor") {
    return (
      <InstructorDashboard
        userName={session.user.name}
        userEmail={userEmail}
        userRole="Senior Instructor"
      />
    );
  }

  // Default: Student
  return (
    <StudentDashboard
      userName={session.user.name}
      userEmail={userEmail}
      userRole="Student"
    />
  );
}
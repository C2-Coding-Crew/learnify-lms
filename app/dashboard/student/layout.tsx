import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import StudentSidebar from "@/components/dashboard/student/sidebar";
import { db } from "@/lib/db";

export default async function StudentLayout({
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

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { roleId: true }
  });

  const roleId = dbUser?.roleId;
  
  if (roleId !== 2) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-[#1E1E1E]">
      <StudentSidebar userName={session.user.name} />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

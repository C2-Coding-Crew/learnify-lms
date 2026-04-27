import InstructorSidebar from "@/components/dashboard/instructor/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function InstructorLayout({
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

  const { getSidebarMenus } = await import("@/lib/actions/sidebar-actions");
  const menus = await getSidebarMenus(2);

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-[#1E1E1E]">
      <InstructorSidebar menus={menus} />
      {children}
    </div>
  );
}

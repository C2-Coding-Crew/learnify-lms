import InstructorSidebar from "@/components/dashboard/instructor/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

  const roleId = (session.user as any).roleId;
  if (roleId !== 3) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-[#1E1E1E]">
      <InstructorSidebar />
      {children}
    </div>
  );
}

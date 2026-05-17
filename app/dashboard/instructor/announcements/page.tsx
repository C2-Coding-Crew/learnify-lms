import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import AnnouncementsClient from "@/app/dashboard/instructor/announcements/announcements-client";

export default async function InstructorAnnouncementsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/login");

  const roleId = (session.user as any).roleId;
  if (Number(roleId) !== 2) redirect("/dashboard");

  const instructorId = session.user.id;

  // Fetch instructor's courses for the selection dropdown
  const courses = await db.course.findMany({
    where: { instructorId, isDeleted: 0 },
    select: { id: true, title: true }
  });

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Course Announcements 📢" 
        subtitle="Keep your students informed about updates and news."
      />

      <AnnouncementsClient courses={courses} />
    </main>
  );
}

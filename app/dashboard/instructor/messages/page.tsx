import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import MessagesClient from "./messages-client";

export default async function InstructorMessagesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 3) {
    redirect("/dashboard");
  }

  const instructorId = session.user.id;

  // Fetch courses taught by this instructor to show as "Groups"
  const courses = await db.course.findMany({
    where: {
      instructorId,
      isDeleted: 0,
      status: 1
    },
    select: {
      id: true,
      title: true,
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { createdDate: "desc" }
  });

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full h-screen flex flex-col">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Discussions 💬" 
        subtitle="Discuss with your students in course groups."
      />

      <MessagesClient 
        courses={courses} 
        currentUserId={session.user.id} 
      />
    </main>
  );
}

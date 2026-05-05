import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MessagesClient from "../../instructor/messages/messages-client";

export default async function StudentDiscussionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;

  // Fetch courses student is enrolled in to show as "Groups"
  const enrollments = await db.enrollment.findMany({
    where: {
      userId,
      isDeleted: 0,
      enrollmentStatus: { in: ["active", "completed"] }
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          _count: {
            select: { enrollments: true }
          }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  });

  const courses = enrollments.map(enr => enr.course);

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full h-screen flex flex-col bg-[#FDFDFD]">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Group Discussions 💬
        </h1>
        <p className="text-slate-400 text-sm font-bold mt-1">
          Chat with your instructor and fellow students in your enrolled courses.
        </p>
      </div>

      <MessagesClient 
        courses={courses} 
        currentUserId={session.user.id} 
      />
    </main>
  );
}

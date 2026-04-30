"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function submitAssignment(assignmentId: number, content: string, fileUrl?: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const submission = await db.submission.upsert({
    where: { 
      assignmentId_userId: {
        assignmentId,
        userId: session.user.id
      }
    },
    update: {
      content,
      fileUrl,
      status: "submitted",
      lastUpdatedBy: session.user.name || "USER",
    },
    create: {
      assignmentId,
      userId: session.user.id,
      content,
      fileUrl,
      status: "submitted",
      createdBy: session.user.name || "USER",
    },
  });

  revalidatePath("/dashboard/student/assignments");
  return submission;
}

export async function getStudentAssignments() {
  const session = await getSession();
  if (!session) return [];

  // Ambil assignment dari kursus yang diikuti siswa
  const assignments = await db.assignment.findMany({
    where: {
      course: {
        enrollments: {
          some: { userId: session.user.id, isDeleted: 0 }
        }
      },
      isDeleted: 0,
      status: 1
    },
    include: {
      course: { select: { title: true } },
      submissions: {
        where: { userId: session.user.id }
      }
    },
    orderBy: { createdDate: "desc" }
  });

  return assignments.map((a: any) => ({
    id: a.id,
    title: a.title,
    course: a.course.title,
    dueDate: a.dueDate ? a.dueDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "No due date",
    status: a.submissions[0]?.status || "pending",
    grade: a.submissions[0]?.grade || null,
    submittedContent: a.submissions[0]?.content || null
  }));
}

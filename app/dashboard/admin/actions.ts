"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    throw new Error("Forbidden");
  }

  return session;
}

export async function approveCourse(courseId: number) {
  await verifyAdmin();
  
  await db.course.update({
    where: { id: courseId },
    data: { isPublished: true },
  });
  
  revalidatePath("/dashboard/admin/courses/approvals");
  revalidatePath("/courses");
  return { success: true };
}

export async function rejectCourse(courseId: number) {
  await verifyAdmin();
  
  await db.course.update({
    where: { id: courseId },
    data: { isDeleted: 1, status: 0 },
  });
  
  revalidatePath("/dashboard/admin/courses/approvals");
  return { success: true };
}

export async function toggleUserStatus(userId: string, currentStatus: number) {
  await verifyAdmin();
  
  const newStatus = currentStatus === 1 ? 0 : 1;
  
  await db.user.update({
    where: { id: userId },
    data: { status: newStatus },
  });
  
  revalidatePath("/dashboard/admin/students");
  revalidatePath("/dashboard/admin/instructors");
  return { success: true, newStatus };
}

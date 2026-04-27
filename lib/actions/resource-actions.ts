"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getStudentResources() {
  const session = await getSession();
  if (!session) return [];

  // Ambil resource dari kursus yang diikuti siswa
  const resources = await db.resource.findMany({
    where: {
      OR: [
        { courseId: null }, // Global resources
        {
          course: {
            enrollments: {
              some: { userId: session.user.id, isDeleted: 0 }
            }
          }
        }
      ],
      isDeleted: 0,
      status: 1
    },
    include: {
      course: { select: { title: true } }
    },
    orderBy: { createdDate: "desc" }
  });

  return resources.map((r: any) => ({
    id: r.id,
    title: r.title,
    course: r.course?.title || "General",
    type: r.type,
    url: r.url,
    size: "N/A", // We could store size in DB if needed
    date: r.createdDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  }));
}

export async function getStudentRecordings() {
  const session = await getSession();
  if (!session) return [];

  const recordings = await db.resource.findMany({
    where: {
      type: "video",
      OR: [
        { courseId: null },
        {
          course: {
            enrollments: {
              some: { userId: session.user.id, isDeleted: 0 }
            }
          }
        }
      ],
      isDeleted: 0,
      status: 1
    },
    include: {
      course: { select: { title: true } }
    },
    orderBy: { createdDate: "desc" }
  });

  return recordings.map((r: any) => ({
    id: r.id,
    title: r.title,
    course: r.course?.title || "General",
    duration: "N/A", // Durasi bisa disimpan di DB jika perlu
    date: r.createdDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    url: r.url
  }));
}

"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getStudentSchedule() {
  const session = await getSession();
  if (!session) return [];

  const schedules = await db.schedule.findMany({
    where: {
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
    orderBy: { startTime: "asc" }
  });

  // Group by day
  const grouped: Record<string, any> = {};

  schedules.forEach((s: any) => {
    const dateStr = s.startTime.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    const dayName = s.startTime.toLocaleDateString("en-US", { weekday: "long" });
    
    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        id: dateStr,
        day: dayName,
        date: dateStr,
        events: []
      };
    }

    grouped[dateStr].events.push({
      time: s.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      title: s.title,
      type: s.type,
      course: s.course?.title || "General"
    });
  });

  return Object.values(grouped);
}

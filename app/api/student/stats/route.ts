import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { points: true, streak: true, lastStudyDate: true }
  });

  // Get all users with points > 0 to calculate rank
  const users = await db.user.findMany({
    where: { isDeleted: 0, points: { gt: 0 } },
    orderBy: { points: "desc" },
    select: { id: true }
  });
  
  const userIndex = users.findIndex(u => u.id === userId);
  const rank = userIndex !== -1 ? userIndex + 1 : "-";

  // Analytics: study activity
  const recentActivity = await db.lessonProgress.findMany({
    where: { 
      userId, 
      isCompleted: true,
      lastUpdatedDate: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)) // last 7 days
      }
    },
    select: { lastUpdatedDate: true }
  });

  return NextResponse.json({
    points: user?.points || 0,
    streak: user?.streak || 0,
    rank,
    totalStudents: users.length,
    weeklyActivity: recentActivity.length,
  });
}

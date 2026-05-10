import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const topStudents = await db.user.findMany({
      where: { 
        roleId: 3, // 3 = Student
        isDeleted: 0,
        points: { gt: 0 }
      },
      orderBy: { points: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        streak: true,
      }
    });

    return NextResponse.json(topStudents);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}

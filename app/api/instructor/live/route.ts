import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function guardInstructor() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).roleId !== 2) {
    return null;
  }
  return session.user;
}

export async function POST(req: NextRequest) {
  const user = await guardInstructor();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { courseId, title, description, startTime, endTime, location } = await req.json();

    if (!courseId || !title || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify course belongs to instructor
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== user.id) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 404 });
    }

    const schedule = await db.schedule.create({
      data: {
        courseId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
      },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

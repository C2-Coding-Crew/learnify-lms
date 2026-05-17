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

async function verifyOwnership(scheduleId: number, instructorId: string) {
  const schedule = await db.schedule.findUnique({
    where: { id: scheduleId },
    include: { course: true }
  });
  if (!schedule || schedule.course.instructorId !== instructorId) {
    return null;
  }
  return schedule;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await guardInstructor();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const scheduleId = parseInt(id, 10);
    const { title, description, startTime, endTime, location } = await req.json();

    const schedule = await verifyOwnership(scheduleId, user.id);
    if (!schedule) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updated = await db.schedule.update({
      where: { id: scheduleId },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        location,
      },
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await guardInstructor();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const scheduleId = parseInt(id, 10);

    const schedule = await verifyOwnership(scheduleId, user.id);
    if (!schedule) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await db.schedule.update({
      where: { id: scheduleId },
      data: { isDeleted: 1, status: 0 },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

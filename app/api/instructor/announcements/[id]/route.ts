import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcementId = parseInt(id);
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.roleId !== 2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, courseId } = await request.json();

    // Verify ownership
    const announcement = await (db as any).announcement.findUnique({
      where: { id: announcementId },
      include: { course: { select: { instructorId: true } } }
    });

    if (!announcement || announcement.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await (db as any).announcement.update({
      where: { id: announcementId },
      data: { title, content, courseId: courseId ? parseInt(courseId) : undefined }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update announcement error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const announcementId = parseInt(id);
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.roleId !== 2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const announcement = await (db as any).announcement.findUnique({
      where: { id: announcementId },
      include: { course: { select: { instructorId: true } } }
    });

    if (!announcement || announcement.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await (db as any).announcement.delete({
      where: { id: announcementId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete announcement error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

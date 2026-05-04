import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// ── Guard: only roleId 1 (admin) may call this ────────────────────────────────
async function guardAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null; // null = access granted
}

// ── PATCH /api/admin/courses/[id] — approve course ────────────────────────────
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardAdmin();
  if (guard) return guard;

  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  const course = await db.course.findUnique({
    where: { id: courseId, isDeleted: 0 },
    select: { id: true, title: true, isPublished: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.isPublished) {
    return NextResponse.json(
      { error: "Course is already published" },
      { status: 409 }
    );
  }

  await db.course.update({
    where: { id: courseId },
    data: {
      isPublished: true,
      lastUpdatedBy: "ADMIN",
    },
  });

  return NextResponse.json({
    success: true,
    message: `Course "${course.title}" has been approved and published.`,
  });
}

// ── DELETE /api/admin/courses/[id] — reject course ────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardAdmin();
  if (guard) return guard;

  const { id } = await params;
  const courseId = parseInt(id, 10);
  if (isNaN(courseId)) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  // Read optional rejection reason from body
  let reason = "Tidak memenuhi standar kualitas platform.";
  try {
    const body = await req.json();
    if (body?.reason?.trim()) reason = body.reason.trim();
  } catch {
    // body is optional
  }

  const course = await db.course.findUnique({
    where: { id: courseId, isDeleted: 0 },
    select: { id: true, title: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Soft-delete: mark as rejected (status=0, isDeleted=1)
  await db.course.update({
    where: { id: courseId },
    data: {
      isDeleted: 1,
      status: 0,
      lastUpdatedBy: "ADMIN",
    },
  });

  return NextResponse.json({
    success: true,
    message: `Course "${course.title}" has been rejected.`,
    reason,
  });
}

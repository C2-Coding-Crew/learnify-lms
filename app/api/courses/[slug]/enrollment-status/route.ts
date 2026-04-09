import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// ─── GET /api/courses/[slug]/enrollment-status ───────────────────────────────
// Cek apakah user yang login sudah enroll kursus ini
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // Not logged in → belum enroll
  if (!session?.user) {
    return NextResponse.json({ isEnrolled: false, enrollment: null });
  }

  const course = await db.course.findUnique({
    where: { slug, isDeleted: 0 },
    select: { id: true },
  });

  if (!course) {
    return NextResponse.json({ isEnrolled: false, enrollment: null });
  }

  const enrollment = await db.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId: course.id,
      isDeleted: 0,
    },
    select: {
      id: true,
      enrollmentStatus: true,
      enrolledAt: true,
    },
  });

  return NextResponse.json({
    isEnrolled: !!enrollment,
    enrollment: enrollment
      ? {
          ...enrollment,
          enrolledAt: enrollment.enrolledAt.toISOString(),
        }
      : null,
  });
}

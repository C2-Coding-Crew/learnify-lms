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

  const [enrollment, wishlist] = await Promise.all([
    db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
        isDeleted: 0,
      },
      select: {
        id: true,
        enrollmentStatus: true,
        enrolledAt: true,
        certificate: {
          select: { id: true }
        }
      },
    }),
    db.wishlist.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } }
    })
  ]);

  let enrollmentData = enrollment;

  // ── BACKFILL LOGIC: Generate certificate for past completions ──
  if (enrollmentData && enrollmentData.enrollmentStatus === "completed" && !enrollmentData.certificate) {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const year = new Date().getFullYear();
    const certNumber = `LRNFY-CERT-${year}-${randomId}`;

    const newCert = await db.certificate.create({
      data: {
        enrollmentId: enrollmentData.id,
        certificateNumber: certNumber,
        createdBy: "SYSTEM",
      }
    });

    enrollmentData = {
      ...enrollmentData,
      certificate: { id: newCert.id }
    };
  }

  return NextResponse.json({
    isEnrolled: !!enrollmentData,
    isWishlisted: wishlist ? wishlist.isDeleted === 0 : false,
    enrollment: enrollmentData
      ? {
          ...enrollmentData,
          enrolledAt: enrollmentData.enrolledAt.toISOString(),
        }
      : null,
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

const COMPANY = "LEARNIFY";

// ─── GET /api/courses/[slug]/reviews ─────────────────────────────────────────
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(20, parseInt(searchParams.get("limit") ?? "10"));
  const skip = (page - 1) * limit;

  const course = await db.course.findUnique({
    where: { slug, isDeleted: 0 },
    select: { id: true, rating: true, reviewCount: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
  }

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where: { courseId: course.id, isDeleted: 0, status: 1 },
      include: {
        user: { select: { name: true, image: true } },
      },
      orderBy: { createdDate: "desc" },
      skip,
      take: limit,
    }),
    db.review.count({
      where: { courseId: course.id, isDeleted: 0, status: 1 },
    }),
  ]);

  // Hitung distribusi rating
  const ratingDistribution = await db.review.groupBy({
    by: ["rating"],
    where: { courseId: course.id, isDeleted: 0, status: 1 },
    _count: { rating: true },
  });

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingDistribution.forEach((r) => {
    distribution[r.rating] = r._count.rating;
  });

  return NextResponse.json({
    reviews,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating: course.rating,
      reviewCount: course.reviewCount,
      distribution,
    },
  });
}

// ─── POST /api/courses/[slug]/reviews ────────────────────────────────────────
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json();
  const { rating, comment } = body;

  // Validasi rating
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating harus angka 1-5" }, { status: 400 });
  }

  // Cari course
  const course = await db.course.findUnique({
    where: { slug, isDeleted: 0, isPublished: true },
    select: { id: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
  }

  // Validasi user sudah enroll
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId: course.id,
      isDeleted: 0,
      status: 1,
    },
  });

  if (!enrollment) {
    return NextResponse.json(
      { error: "Kamu harus terdaftar di kursus ini untuk memberikan ulasan" },
      { status: 403 }
    );
  }

  // Cek apakah sudah pernah review
  const existing = await db.review.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
  });

  let review;
  if (existing) {
    // Update review yang sudah ada
    review = await db.review.update({
      where: { id: existing.id },
      data: {
        rating,
        comment: comment ?? null,
        lastUpdatedBy: session.user.id,
        lastUpdatedDate: new Date(),
      },
    });
  } else {
    // Buat review baru
    review = await db.review.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        rating,
        comment: comment ?? null,
        companyCode: COMPANY,
        status: 1,
        isDeleted: 0,
        createdBy: session.user.id,
        createdDate: new Date(),
        lastUpdatedBy: session.user.id,
        lastUpdatedDate: new Date(),
      },
    });
  }

  // Recalculate rating kursus
  const stats = await db.review.aggregate({
    where: { courseId: course.id, isDeleted: 0, status: 1 },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const newAvgRating = parseFloat((stats._avg.rating ?? 0).toFixed(1));
  const newReviewCount = stats._count.rating;

  await db.course.update({
    where: { id: course.id },
    data: {
      rating: newAvgRating,
      reviewCount: newReviewCount,
      lastUpdatedBy: session.user.id,
      lastUpdatedDate: new Date(),
    },
  });

  return NextResponse.json(
    { success: true, review, newRating: newAvgRating, reviewCount: newReviewCount },
    { status: existing ? 200 : 201 }
  );
}

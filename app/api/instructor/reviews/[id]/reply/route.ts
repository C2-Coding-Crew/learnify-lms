import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);
    const { reply } = await request.json();

    if (isNaN(reviewId)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instructorId = session.user.id;
    const roleId = (session.user as any).roleId;

    if (Number(roleId) !== 2) {
      return NextResponse.json({ error: "Forbidden: Only instructors can reply" }, { status: 403 });
    }

    // Verify the review belongs to one of the instructor's courses
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        course: { select: { instructorId: true } }
      }
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.course.instructorId !== instructorId) {
      return NextResponse.json({ error: "Forbidden: You don't own this course" }, { status: 403 });
    }

    // Update the review with the reply
    const updatedReview = await (db as any).review.update({
      where: { id: reviewId },
      data: { reply }
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Reply to review error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

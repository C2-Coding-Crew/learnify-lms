import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const assignmentId = parseInt(id, 10);
  const userId = session.user.id;

  try {
    const { content, fileUrl } = await req.json();

    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: "Harap isi jawaban atau lampirkan file URL." },
        { status: 400 }
      );
    }

    // Verify assignment exists and student is enrolled in its course
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId, isDeleted: 0 },
      include: { course: { select: { id: true } } },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Tugas tidak ditemukan." },
        { status: 404 }
      );
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        userId,
        courseId: assignment.course.id,
        isDeleted: 0,
        status: 1,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Kamu tidak terdaftar di kursus ini." },
        { status: 403 }
      );
    }

    // Upsert submission (create or update if already exists)
    const submission = await (db as any).submission.upsert({
      where: {
        userId_assignmentId: { userId, assignmentId },
      },
      create: {
        assignmentId,
        userId,
        content: content || null,
        filePath: fileUrl || null,
        status: "submitted",
        createdBy: userId,
        lastUpdatedBy: userId,
      },
      update: {
        content: content || null,
        filePath: fileUrl || null,
        status: "submitted",
        lastUpdatedBy: userId,
        lastUpdatedDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("Submit assignment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

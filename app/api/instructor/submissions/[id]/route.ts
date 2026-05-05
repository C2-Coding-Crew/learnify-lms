import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissionId = parseInt(id);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const roleId = (session.user as any).roleId;

    const submission = await (db as any).submission.findUnique({
      where: { id: submissionId },
      include: {
        user: { select: { name: true, image: true } },
        assignment: {
          include: {
            course: { select: { instructorId: true, title: true } }
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Security check: Only instructor of this course or admin can view
    const isInstructor = submission.assignment.course.instructorId === userId || roleId === 1;
    if (!isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Submission GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submissionId = parseInt(id);
    const { grade, feedback } = await request.json();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const roleId = (session.user as any).roleId;

    const submission = await (db as any).submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: { select: { instructorId: true } }
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const isInstructor = submission.assignment.course.instructorId === userId || roleId === 1;
    if (!isInstructor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedSubmission = await (db as any).submission.update({
      where: { id: submissionId },
      data: { 
        grade, 
        feedback,
        lastUpdatedDate: new Date()
      }
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error("Submission PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

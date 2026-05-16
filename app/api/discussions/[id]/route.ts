import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { pubsub } from "@/lib/pubsub";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messageId = parseInt(id);

    if (isNaN(messageId)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const roleId = (session.user as any).roleId;

    // Fetch the message to check ownership and course
    const message = await (db as any).courseDiscussion.findUnique({
      where: { id: messageId },
      include: {
        course: { select: { instructorId: true } }
      }
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Permission Check:
    // 1. Admin can delete anything
    // 2. Instructor of the course can delete anything in that course
    // 3. Author can delete their own message
    const isAuthor = message.userId === userId;
    const isCourseInstructor = message.course.instructorId === userId;
    const isAdmin = roleId === 1;

    if (!isAuthor && !isCourseInstructor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await (db as any).courseDiscussion.update({
      where: { id: messageId },
      data: { isDeleted: 1 }
    });

    // Broadcast deletion
    pubsub.publish(`course_${message.courseId}_discussions`, {
      type: "delete",
      id: messageId
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

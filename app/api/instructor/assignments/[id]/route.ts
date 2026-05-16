import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).roleId !== 2) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const assignmentId = parseInt(id);
    const instructorId = session.user.id;

    // Verify ownership
    const assignment = await db.assignment.findFirst({
      where: {
        id: assignmentId,
        course: { instructorId },
      },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found or access denied", { status: 404 });
    }

    await db.assignment.update({
      where: { id: assignmentId },
      data: { isDeleted: 1 },
    });

    return NextResponse.json({ message: "Assignment deleted" });
  } catch (error) {
    console.error("[ASSIGNMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

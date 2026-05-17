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

    const enrollmentId = parseInt(id);
    const instructorId = session.user.id;

    // Verify this enrollment belongs to a course taught by this instructor
    const enrollment = await db.enrollment.findFirst({
      where: {
        id: enrollmentId,
        course: {
          instructorId: instructorId,
        },
      },
    });

    if (!enrollment) {
      return new NextResponse("Enrollment not found or access denied", { status: 404 });
    }

    // Soft delete the enrollment
    await db.enrollment.update({
      where: { id: enrollmentId },
      data: { 
        isDeleted: 1,
        enrollmentStatus: "cancelled" // Or "dropped"
      },
    });

    return NextResponse.json({ message: "Student unenrolled successfully" });
  } catch (error) {
    console.error("[ENROLLMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        lessons: {
          where: { isDeleted: 0 },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Verify ownership
    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("Fetch course error:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const existingCourse = await prisma.course.findUnique({ where: { id: parseInt(id) } });
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && existingCourse.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, categoryId, price, level, thumbnail, isPublished, status } = body;

    // Review Logic:
    // status 1 = Draft
    // status 2 = Pending Review
    // status 3 = Approved (used internally for transition to isPublished=true)
    
    let updateData: any = {
      title: title !== undefined ? title : existingCourse.title,
      description: description !== undefined ? description : existingCourse.description,
      categoryId: categoryId ? parseInt(categoryId) : existingCourse.categoryId,
      price: price !== undefined ? parseFloat(price) : existingCourse.price,
      level: level !== undefined ? level : existingCourse.level,
      thumbnail: thumbnail !== undefined ? thumbnail : existingCourse.thumbnail,
    };

    // Instructor Flow
    if (roleId === 3) {
      // Instructor can set status to 2 (Submit for Review)
      if (status === 2) {
        updateData.status = 2;
      }
      // Instructor CANNOT set isPublished directly
    }

    // Admin Flow
    if (roleId === 1) {
      if (isPublished !== undefined) {
        updateData.isPublished = isPublished;
        if (isPublished === true) {
          updateData.status = 1; // Mark as active/approved
        }
      }
      if (status !== undefined) {
        updateData.status = status;
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    revalidatePath("/courses");
    revalidatePath(`/courses/${updatedCourse.slug}`);
    revalidatePath("/dashboard/instructor/courses");
    revalidatePath("/dashboard/admin/courses/approvals");

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const existingCourse = await prisma.course.findUnique({ where: { id: parseInt(id) } });
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && existingCourse.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.course.update({
      where: { id: parseInt(id) },
      data: { isDeleted: 1, status: 0 }
    });

    revalidatePath("/dashboard/instructor/courses");
    revalidatePath("/courses");
    revalidatePath("/dashboard/admin/courses/approvals");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const prisma = new PrismaClient();

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
    const { title, description, categoryId, price, level, thumbnail, isPublished } = body;

    // SECURITY GUARD: Hanya Admin yang boleh mempublikasikan kursus (isPublished = true)
    // Instruktur hanya boleh mengedit (Draft) atau membatalkan publikasi (isPublished = false)
    let finalIsPublished = existingCourse.isPublished;
    if (isPublished !== undefined) {
      if (roleId === 1) {
        finalIsPublished = isPublished; // Admin bebas
      } else if (isPublished === false) {
        finalIsPublished = false; // Instruktur boleh unpublish (menarik kursus)
      }
      // Jika instruktur mencoba isPublished = true, kita abaikan (tetap gunakan status sebelumnya)
    }

    const updatedCourse = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        title: title !== undefined ? title : existingCourse.title,
        description: description !== undefined ? description : existingCourse.description,
        categoryId: categoryId ? parseInt(categoryId) : existingCourse.categoryId,
        price: price !== undefined ? parseFloat(price) : existingCourse.price,
        level: level !== undefined ? level : existingCourse.level,
        thumbnail: thumbnail !== undefined ? thumbnail : existingCourse.thumbnail,
        isPublished: finalIsPublished,
      }
    });

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}

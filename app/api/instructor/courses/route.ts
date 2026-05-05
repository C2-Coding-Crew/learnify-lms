import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instructorId = session.user.id;
    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && roleId !== 2) {
      return NextResponse.json({ error: "Forbidden: Only instructors can create courses" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, categoryId, price, level, thumbnail } = body;

    if (!title || !categoryId || !price || !level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let slug = generateSlug(title);
    // Ensure slug is unique
    let counter = 1;
    let existingCourse = await prisma.course.findUnique({ where: { slug } });
    while (existingCourse) {
      slug = `${generateSlug(title)}-${counter}`;
      counter++;
      existingCourse = await prisma.course.findUnique({ where: { slug } });
    }

    const course = await prisma.course.create({
      data: {
        instructorId,
        categoryId: parseInt(categoryId),
        title,
        slug,
        description: description || "",
        thumbnail,
        price: parseFloat(price),
        level,
        isPublished: false,
        status: 1,
        isDeleted: 0,
      }
    });

    revalidatePath("/dashboard/instructor");
    revalidatePath("/dashboard/instructor/courses");

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instructorId = session.user.id;

    const courses = await prisma.course.findMany({
      where: {
        instructorId,
        isDeleted: 0,
        status: 1
      },
      include: {
        category: true,
        _count: {
          select: { lessons: true, enrollments: true }
        }
      },
      orderBy: { createdDate: "desc" }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Fetch courses error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

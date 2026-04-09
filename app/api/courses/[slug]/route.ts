import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: {
      slug,
      isDeleted: 0, // soft delete filter
      status: 1,
    },
    include: {
      instructor: {
        select: { id: true, name: true, image: true, email: true },
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
      lessons: {
        where: { isDeleted: 0, status: 1 },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          order: true,
          isFree: true,
        },
      },
      tags: {
        where: { isDeleted: 0 },
        select: { name: true },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: "Kursus tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(course);
}

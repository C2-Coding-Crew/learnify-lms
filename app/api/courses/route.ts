import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category"); // slug: "design", "development", dll
  const search = searchParams.get("search");
  const isDeleted = 0; // soft delete filter — selalu exclude data terhapus

  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      isDeleted,
      status: 1,
      ...(categorySlug && categorySlug !== "semua"
        ? { category: { slug: categorySlug } }
        : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      instructor: { select: { id: true, name: true, image: true } },
      category:   { select: { id: true, name: true, slug: true } },
      tags:       { select: { name: true } },
      _count:     { select: { enrollments: true } },
    },
    orderBy: [{ isPopular: "desc" }, { rating: "desc" }],
  });

  return NextResponse.json(courses);
}

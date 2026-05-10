import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import StudentCourseDetail from "@/components/dashboard/student/course-detail";

export default async function StudentExploreCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const course = await db.course.findUnique({
    where: { 
      slug,
      isPublished: true,
      isDeleted: 0,
      status: 1 
    },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, image: true, email: true } },
      lessons: { 
        where: { isDeleted: 0, status: 1 },
        orderBy: { order: "asc" }
      },
      tags: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    notFound();
  }

  // Convert Decimal to number for serialization
  const serializedCourse = {
    ...course,
    price: Number(course.price),
  };

  return <StudentCourseDetail course={serializedCourse as any} />;
}

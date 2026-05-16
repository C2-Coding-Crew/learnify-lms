import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import LearnPageClient from "@/components/courses/learn-page";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function LearnPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lesson: lessonIdStr } = await searchParams;

  // 1. Auth guard — harus login
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=/courses/${slug}/learn`);
  }

  // 2. Ambil kursus
  const course = await db.course.findUnique({
    where: { slug, isDeleted: 0, isPublished: true },
    include: {
      category: { select: { name: true, slug: true } },
      instructor: { select: { name: true, image: true } },
      lessons: {
        where: { isDeleted: 0, status: 1 },
        orderBy: { order: "asc" },
      },
      quizzes: {
        where: { isDeleted: 0, status: 1 },
        include: {
          _count: { select: { questions: true } }
        }
      }
    },
  });

  if (!course) redirect("/courses");

  // 3. Cek enrollment — harus sudah enroll DAN aktif/selesai (bukan pending_payment)
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId: course.id,
      isDeleted: 0,
      enrollmentStatus: { in: ["active", "completed"] },
    },
  });

  if (!enrollment) {
    // Cek apakah ada enrollment pending_payment → arahkan ke checkout
    const pendingEnrollment = await db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
        isDeleted: 0,
        enrollmentStatus: "pending_payment",
      },
    });

    if (pendingEnrollment) {
      const pendingInvoice = await db.invoice.findFirst({
        where: {
          userId: session.user.id,
          courseId: course.id,
          invoiceStatus: "pending",
          isDeleted: 0,
        },
        select: { invoiceNumber: true },
        orderBy: { createdDate: "desc" },
      });

      if (pendingInvoice) {
        redirect(`/checkout/${pendingInvoice.invoiceNumber}`);
      }
    }

    redirect(`/courses/${slug}`);
  }

  // 4. Ambil progress user
  const progressRecords = await db.lessonProgress.findMany({
    where: {
      userId: session.user.id,
      lesson: { courseId: course.id },
      isDeleted: 0,
    },
    select: { lessonId: true, isCompleted: true, watchedSecs: true },
  });

  const progressMap = Object.fromEntries(
    progressRecords.map((p) => [
      String(p.lessonId),
      { isCompleted: p.isCompleted, watchedSecs: p.watchedSecs },
    ])
  );

  // 5. Tentukan lesson aktif
  const lessonId = lessonIdStr ? parseInt(lessonIdStr) : course.lessons[0]?.id;
  const activeLesson = course.lessons.find((l) => l.id === lessonId) ?? course.lessons[0];

  const completedCount = progressRecords.filter((p) => p.isCompleted).length;
  const progressPercent = course.lessons.length > 0
    ? Math.round((completedCount / course.lessons.length) * 100)
    : 0;

  return (
    <LearnPageClient
      course={{
        id: course.id,
        title: course.title,
        slug: course.slug,
        totalLessons: course.totalLessons,
        category: course.category,
        instructor: course.instructor,
        lessons: course.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          duration: l.duration,
          order: l.order,
          isFree: l.isFree,
          description: l.description,
          videoUrl: l.videoUrl,
        })),
        quizzes: course.quizzes.map(q => ({
          id: q.id,
          lessonId: q.lessonId,
          title: q.title,
          description: q.description,
          questionCount: q._count.questions,
          passingScore: q.passingScore
        }))
      }}
      activeLessonId={activeLesson?.id ?? null}
      progressMap={progressMap}
      progressPercent={progressPercent}
      completedCount={completedCount}
      userId={session.user.id}
    />
  );
}

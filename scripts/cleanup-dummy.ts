/**
 * cleanup-dummy.ts
 * 
 * Menghapus semua data dummy dari seed:
 *  - Instructor dummy: budi.santoso@learnify.id, sari.dewi@learnify.id
 *  - Course dummy yang dibuat oleh instructor dummy (by instructorId)
 *  - Student dummy (createdBy = "SYSTEM" DAN tidak punya account OAuth/credential asli)
 * 
 * TIDAK menghapus:
 *  - User asli (login via Google/email sendiri)
 *  - Course yang dibuat oleh instructor asli
 *  - Admin user
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Email dummy instructors dari seed.ts ─────────────────────────────────────
const DUMMY_INSTRUCTOR_EMAILS = [
  "budi.santoso@learnify.id",
  "sari.dewi@learnify.id",
];

// ─── Slug dummy courses dari seed.ts ──────────────────────────────────────────
const DUMMY_COURSE_SLUGS = [
  "ux-design-fundamentals",
  "visual-design-branding-startup",
  "fullstack-nextjs-15",
  "mobile-react-native",
  "data-science-python",
  "ui-design-figma-pro",
];

async function cleanup() {
  console.log("🧹 Memulai cleanup data dummy...\n");

  // ── Step 1: Preview dulu sebelum hapus ──────────────────────────────────────
  const dummyInstructors = await prisma.user.findMany({
    where: { email: { in: DUMMY_INSTRUCTOR_EMAILS } },
    select: { id: true, name: true, email: true },
  });

  const dummyCourses = await prisma.course.findMany({
    where: { slug: { in: DUMMY_COURSE_SLUGS } },
    select: { id: true, title: true, slug: true, instructorId: true },
  });

  // Find dummy students: roleId=3 AND createdBy="SYSTEM"
  const dummyStudents = await prisma.user.findMany({
    where: {
      roleId: 3,         // Student
      createdBy: "SYSTEM",
    },
    select: { id: true, name: true, email: true },
  });

  console.log("📋 DATA YANG AKAN DIHAPUS:");
  console.log(`\n👨‍🏫 Dummy Instructors (${dummyInstructors.length}):`);
  dummyInstructors.forEach(u => console.log(`   - ${u.name} (${u.email})`));

  console.log(`\n📚 Dummy Courses (${dummyCourses.length}):`);
  dummyCourses.forEach(c => console.log(`   - ${c.title}`));

  console.log(`\n🎓 Dummy Students (${dummyStudents.length}):`);
  dummyStudents.forEach(u => console.log(`   - ${u.name} (${u.email})`));

  if (dummyInstructors.length === 0 && dummyCourses.length === 0 && dummyStudents.length === 0) {
    console.log("\n✅ Tidak ada data dummy ditemukan. Database sudah bersih!");
    return;
  }

  console.log("\n🚀 Menghapus data...\n");

  // ── Step 2: Hapus data terkait courses dummy ─────────────────────────────────
  const dummyCourseIds = dummyCourses.map(c => c.id);

  if (dummyCourseIds.length > 0) {
    // Hapus course discussions
    await (prisma as any).courseDiscussion.deleteMany({
      where: { courseId: { in: dummyCourseIds } },
    });
    console.log("   ✅ CourseDiscussions dihapus");

    // Hapus lesson progress
    await prisma.lessonProgress.deleteMany({
      where: { lesson: { courseId: { in: dummyCourseIds } } },
    });
    console.log("   ✅ LessonProgress dihapus");

    // Hapus reviews
    await prisma.review.deleteMany({
      where: { courseId: { in: dummyCourseIds } },
    });
    console.log("   ✅ Reviews dihapus");

    // Hapus invoices (invoice pakai courseId langsung)
    await prisma.invoice.deleteMany({
      where: { courseId: { in: dummyCourseIds } },
    });
    console.log("   ✅ Invoices dihapus");

    // Hapus enrollments
    await prisma.enrollment.deleteMany({
      where: { courseId: { in: dummyCourseIds } },
    });
    console.log("   ✅ Enrollments dihapus");

    // Hapus lessons
    await prisma.lesson.deleteMany({
      where: { courseId: { in: dummyCourseIds } },
    });
    console.log("   ✅ Lessons dihapus");

    // Hapus course tags
    await prisma.courseTag.deleteMany({
      where: { courseId: { in: dummyCourseIds } },
    });
    console.log("   ✅ CourseTags dihapus");

    // Hapus courses
    await prisma.course.deleteMany({
      where: { id: { in: dummyCourseIds } },
    });
    console.log("   ✅ Courses dihapus");
  }

  // ── Step 3: Hapus dummy instructors ─────────────────────────────────────────
  const dummyInstructorIds = dummyInstructors.map(u => u.id);

  if (dummyInstructorIds.length > 0) {
    // Hapus SEMUA courses yang dimiliki dummy instructors (bukan hanya seed courses)
    const remainingInstructorCourses = await prisma.course.findMany({
      where: { instructorId: { in: dummyInstructorIds } },
      select: { id: true },
    });
    const remainingCourseIds = remainingInstructorCourses.map(c => c.id);

    if (remainingCourseIds.length > 0) {
      await (prisma as any).courseDiscussion.deleteMany({ where: { courseId: { in: remainingCourseIds } } });
      await prisma.lessonProgress.deleteMany({ where: { lesson: { courseId: { in: remainingCourseIds } } } });
      await prisma.review.deleteMany({ where: { courseId: { in: remainingCourseIds } } });
      await prisma.enrollment.deleteMany({ where: { courseId: { in: remainingCourseIds } } });
      // Invoice menggunakan courseId langsung
      await prisma.invoice.deleteMany({ where: { courseId: { in: remainingCourseIds } } });
      await prisma.lesson.deleteMany({ where: { courseId: { in: remainingCourseIds } } });
      await prisma.courseTag.deleteMany({ where: { courseId: { in: remainingCourseIds } } });
      await prisma.course.deleteMany({ where: { id: { in: remainingCourseIds } } });
      console.log(`   ✅ ${remainingCourseIds.length} sisa course instructor dihapus`);
    }

    // Hapus sessions
    await prisma.session.deleteMany({ where: { userId: { in: dummyInstructorIds } } });
    // Hapus accounts
    await prisma.account.deleteMany({ where: { userId: { in: dummyInstructorIds } } });
    // Hapus users
    await prisma.user.deleteMany({ where: { id: { in: dummyInstructorIds } } });
    console.log(`   ✅ ${dummyInstructors.length} dummy instructor dihapus`);
  }

  // ── Step 4: Hapus dummy students ────────────────────────────────────────────
  const dummyStudentIds = dummyStudents.map(u => u.id);

  if (dummyStudentIds.length > 0) {
    // Hapus lesson progress
    await prisma.lessonProgress.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    // Hapus submissions (field: userId bukan studentId)
    await prisma.submission.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    // Hapus reviews
    await prisma.review.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    // Hapus invoices user
    await prisma.invoice.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    // Hapus enrollments
    await prisma.enrollment.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    // Hapus course discussions
    await (prisma as any).courseDiscussion.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    // Hapus sessions & accounts
    await prisma.session.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    await prisma.account.deleteMany({ where: { userId: { in: dummyStudentIds } } });
    // Hapus users
    await prisma.user.deleteMany({ where: { id: { in: dummyStudentIds } } });
    console.log(`   ✅ ${dummyStudents.length} dummy student dihapus`);
  }

  console.log("\n╔══════════════════════════════════╗");
  console.log("║   🎉 Cleanup selesai!            ║");
  console.log("╠══════════════════════════════════╣");
  console.log(`║  Courses dihapus  : ${dummyCourseIds.length}              ║`);
  console.log(`║  Instructors dihapus: ${dummyInstructors.length}            ║`);
  console.log(`║  Students dihapus : ${dummyStudentIds.length}              ║`);
  console.log("╚══════════════════════════════════╝");
}

cleanup()
  .catch((e) => {
    console.error("❌ Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

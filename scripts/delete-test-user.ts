import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ID test user AI yang akan dihapus
const TEST_USER_ID = "8f54de9c-add7-42a5-8161-566283a39c27";

async function deleteTestUser() {
  console.log("🗑️ Menghapus Test User AI...\n");

  // Hapus semua course milik test user ini (jika ada)
  const ownedCourses = await prisma.course.findMany({
    where: { instructorId: TEST_USER_ID },
    select: { id: true, title: true },
  });

  if (ownedCourses.length > 0) {
    const courseIds = ownedCourses.map(c => c.id);
    console.log(`📚 Menghapus ${ownedCourses.length} course milik test user...`);
    await (prisma as any).courseDiscussion.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.lessonProgress.deleteMany({ where: { lesson: { courseId: { in: courseIds } } } });
    await prisma.review.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.enrollment.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.invoice.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.lesson.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.courseTag.deleteMany({ where: { courseId: { in: courseIds } } });
    await prisma.course.deleteMany({ where: { id: { in: courseIds } } });
    console.log("   ✅ Courses dihapus");
  }

  // Hapus relasi user
  await prisma.lessonProgress.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.review.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.invoice.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.enrollment.deleteMany({ where: { userId: TEST_USER_ID } });
  await (prisma as any).courseDiscussion.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.session.deleteMany({ where: { userId: TEST_USER_ID } });
  await prisma.account.deleteMany({ where: { userId: TEST_USER_ID } });

  // Hapus user
  await prisma.user.delete({ where: { id: TEST_USER_ID } });

  console.log("   ✅ Test User AI (test-1777260919103@example.com) berhasil dihapus!");
}

deleteTestUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

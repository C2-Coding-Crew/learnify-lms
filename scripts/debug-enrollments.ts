import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function debugEnrollments() {
  const instructorId = "3o3wWbz30GtH4DlBgBEXm6dvPSiVE7nC"; // Fauzi 312410640
  
  console.log("Debugging enrollments for Instructor:", instructorId);
  
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId }
      },
      include: {
        course: { select: { title: true } },
        user: { select: { name: true, email: true } }
      }
    });

    console.log("\nFound enrollments:", enrollments.length);
    enrollments.forEach(e => {
      console.log(`- Student: ${e.user.name} (${e.user.email})`);
      console.log(`  Course: ${e.course.title}`);
      console.log(`  Status: ${e.enrollmentStatus}`);
      console.log(`  isDeleted: ${e.isDeleted}`);
      console.log("-------------------");
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

debugEnrollments().finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkInstructorDeps() {
  console.log("Checking database tables for Instructor Dashboard...");
  
  try {
    const roles = await prisma.role.count();
    const categories = await prisma.category.count();
    const courses = await prisma.course.count();
    const lessons = await prisma.lesson.count();
    const users = await prisma.user.count();
    const schedules = await prisma.schedule.count();

    console.log(`\n--- DATABASE STATS ---`);
    console.log(`- Roles: ${roles}`);
    console.log(`- Categories: ${categories}`);
    console.log(`- Total Users: ${users}`);
    console.log(`- Total Courses: ${courses}`);
    console.log(`- Total Lessons: ${lessons}`);
    console.log(`- Live Sessions (Schedules): ${schedules}`);
    
    if (categories === 0) {
      console.warn("\nWARNING: No categories found! Create Course will NOT work properly.");
    }
    
    if (roles < 3) {
      console.warn("\nWARNING: Some roles are missing (Should be at least 3: Admin, Instructor, Student).");
    }

    const instructorCourses = await prisma.course.findMany({
        where: { instructorId: "3o3wWbz30GtH4DlBgBEXm6dvPSiVE7nC", isDeleted: 0 },
        select: { id: true, title: true }
    });
    console.log("\nCourses for Fauzi 312410640:", instructorCourses.length);

  } catch (err) {
    console.error("Error:", err);
  }
}

checkInstructorDeps().finally(() => prisma.$disconnect());

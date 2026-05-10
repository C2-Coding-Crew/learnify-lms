import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  console.log("DATABASE_URL from process.env:", process.env.DATABASE_URL);
  try {
    const userCount = await prisma.user.count();
    console.log("Successful connection! User count:", userCount);
    
    const users = await prisma.user.findMany({
      select: { email: true, roleId: true },
      take: 5
    });
    console.log("Sample users:", JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Connection error:", err);
  }
}

check().finally(() => prisma.$disconnect());

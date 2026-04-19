const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const users = await prisma.user.findMany({ select: { name: true, email: true, twoFactorEnabled: true} });
  console.log("Users:", users);
}

checkUser().finally(() => prisma.$disconnect());

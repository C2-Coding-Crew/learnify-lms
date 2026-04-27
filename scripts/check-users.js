const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      take: 5,
      select: { email: true, name: true, roleId: true }
    });
    
    console.log('--- DATABASE CHECK ---');
    console.log('Total Users:', userCount);
    console.log('Recent Users:', JSON.stringify(users, null, 2));
    console.log('----------------------');
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();

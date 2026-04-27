const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log('--- DATABASE ROLES ---');
    console.log(JSON.stringify(roles, null, 2));
    console.log('----------------------');
  } catch (error) {
    console.error('Error checking roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();

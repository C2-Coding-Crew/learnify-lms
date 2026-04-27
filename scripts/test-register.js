const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const testEmail = 'test-' + Date.now() + '@example.com';
    const newUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User AI',
        roleId: 2,
        emailVerified: true
      }
    });
    
    console.log('✅ SUCCESS! User created in Neon:');
    console.log(JSON.stringify(newUser, null, 2));
  } catch (error) {
    console.error('❌ FAILED to create user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

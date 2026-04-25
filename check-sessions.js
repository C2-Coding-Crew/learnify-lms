const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSessions() {
  const sessions = await prisma.session.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { user: { select: { email: true, twoFactorEnabled: true } } }
  });
  console.log("Latest Sessions:");
  sessions.forEach(s => {
    console.log(`- Token: ${s.token.substring(0, 10)}... | User: ${s.user.email} (2FA: ${s.user.twoFactorEnabled})`);
  });
}

checkSessions().finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("\n=== USERS WITH ACCOUNTS ===");
  const users = await prisma.user.findMany({
    include: {
      accounts: {
        select: { providerId: true, password: true }
      }
    }
  });
  
  for (const user of users) {
    const hasPassword = user.accounts.some(a => a.providerId === 'credential' && a.password);
    console.log(`
✓ ${user.name} (${user.email})
  - ID: ${user.id}
  - Has Password Account: ${hasPassword}
  - Accounts: ${user.accounts.map(a => a.providerId).join(', ')}
    `);
  }

  console.log("\n=== SESSION COUNT ===");
  const sessionCount = await prisma.session.count();
  console.log(`Total sessions: ${sessionCount}`);

  if (sessionCount > 0) {
    const sessions = await prisma.session.findMany({
      select: { userId: true, expiresAt: true }
    });
    sessions.forEach(s => {
      console.log(`- User ${s.userId}: expires ${s.expiresAt}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("\n=== ALL SESSIONS ===");
  const sessions = await prisma.session.findMany({
    include: {
      user: {
        select: { id: true, email: true, name: true }
      }
    }
  });
  console.log(JSON.stringify(sessions, null, 2));

  console.log("\n=== ORPHANED SESSIONS (User tidak ada di DB) ===");
  const allSessions = await prisma.session.findMany();
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  const userIds = new Set(allUsers.map(u => u.id));
  
  const orphaned = allSessions.filter(s => !userIds.has(s.userId));
  if (orphaned.length > 0) {
    console.log(`Found ${orphaned.length} orphaned sessions:`);
    console.log(JSON.stringify(orphaned, null, 2));
  } else {
    console.log("✓ No orphaned sessions found");
  }

  console.log("\n=== SESSION COUNT BY USER ===");
  const sessionCount = await prisma.session.groupBy({
    by: ['userId'],
    _count: true
  });
  console.log(JSON.stringify(sessionCount, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

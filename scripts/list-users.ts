import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function listAllUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, roleId: true, createdBy: true, createdDate: true },
    orderBy: { createdDate: "asc" },
  });

  console.log(`\nTotal users: ${users.length}\n`);
  users.forEach(u => {
    console.log(`[roleId=${u.roleId}] ${u.name} | ${u.email} | createdBy=${u.createdBy} | id=${u.id}`);
  });
}

listAllUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

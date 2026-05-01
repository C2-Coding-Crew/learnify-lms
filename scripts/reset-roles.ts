import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  const result = await prisma.user.updateMany({
    where: {
      email: {
        not: adminEmail || undefined,
      },
    },
    data: {
      roleId: null,
    },
  });

  console.log(`Reset roleId to null for ${result.count} users.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

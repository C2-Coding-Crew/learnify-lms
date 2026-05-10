import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: {
      email: "mbuhs7488@gmail.com",
    },
    data: {
      roleId: null,
    },
  });

  console.log(`Reset roleId to null for ${result.count} user(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

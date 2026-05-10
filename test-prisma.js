const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 1 });
  console.log('Users:', users);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

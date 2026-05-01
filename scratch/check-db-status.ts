import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Roles ---');
  console.log(JSON.stringify(await prisma.role.findMany(), null, 2));
  console.log('--- Users ---');
  console.log(JSON.stringify(await prisma.user.findMany(), null, 2));
  console.log('--- Accounts ---');
  console.log(JSON.stringify(await prisma.account.findMany(), null, 2));
  console.log('--- Sessions ---');
  console.log(JSON.stringify(await prisma.session.findMany(), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

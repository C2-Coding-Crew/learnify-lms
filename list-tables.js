const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const res = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;
  console.log(res);
}
run().finally(() => prisma.$disconnect());

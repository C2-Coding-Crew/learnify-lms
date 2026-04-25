import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany({
      include: { accounts: true }
    });
    console.log("=== DAFTAR USER DI DATABASE ===");
    users.forEach(u => {
      console.log(`- Email: ${u.email} | Name: ${u.name} | Role: ${u.roleId}`);
      u.accounts.forEach(a => {
        console.log(`  └ Account: Provider: ${a.providerId} | HasPassword: ${!!a.password}`);
      });
    });
    console.log("===============================");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();

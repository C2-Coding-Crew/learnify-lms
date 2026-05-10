import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function testSync() {
  const email = "mbuhs7488@gmail.com";
  console.log(`Updating companyCode for ${email}...`);
  
  try {
    const updated = await prisma.user.update({
      where: { email },
      data: { companyCode: "TEST_NEON_SYNC" }
    });
    
    console.log("Update successful!");
    console.log("Current data in DB for this user:");
    console.log(`- Email: ${updated.email}`);
    console.log(`- RoleId: ${updated.roleId}`);
    console.log(`- CompanyCode: ${updated.companyCode}`);
    console.log("\nSilakan cek di Neon Console Anda sekarang. Apakah column 'companyCode' untuk user ini sudah berubah menjadi 'TEST_NEON_SYNC'?");
  } catch (err) {
    console.error("Error during update:", err);
  }
}

testSync().finally(() => prisma.$disconnect());

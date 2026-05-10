import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function forceInstructor() {
  const email = "fauzi.312410640@mhs.pelitabangsa.ac.id";
  console.log(`Forcing ${email} to become Instructor (roleId: 2)...`);
  
  try {
    const updated = await prisma.user.update({
      where: { email },
      data: { roleId: 2 }
    });
    
    console.log("SUCCESS!");
    console.log(`User ${updated.name} now has roleId: ${updated.roleId}`);
    
    // Juga pastikan user lain yang di screenshot adalah 2 jika memang seharusnya begitu
    const others = [
      "kurniawantomi551@gmail.com",
      "sanudin@pelitabangsa.ac.id",
      "farhansyah.it@gmail.com",
      "poppimarsanti12@gmail.com"
    ];
    
    console.log("\nSyncing other instructors from your screenshot...");
    await prisma.user.updateMany({
      where: { email: { in: others } },
      data: { roleId: 2 }
    });
    console.log("All synced!");
    
  } catch (err) {
    console.error("Error:", err);
  }
}

forceInstructor().finally(() => prisma.$disconnect());

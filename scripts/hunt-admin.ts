import { PrismaClient } from "@prisma/client";
import * as path from "path";

async function hunt() {
  const email = "admin@learnify.id";
  const possiblePaths = [
    "file:./dev.db",
    "file:./prisma/dev.db",
    `file:${path.join(process.cwd(), "dev.db")}`,
    `file:${path.join(process.cwd(), "prisma", "dev.db")}`
  ];

  for (const url of possiblePaths) {
    console.log(`Checking ${url}...`);
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        console.log(`✅ FOUND in ${url}! Promoting to Admin...`);
        await prisma.user.update({
          where: { email },
          data: { roleId: 1 }
        });
        console.log(`🚀 SUCCESS: ${email} is now Admin in ${url}`);
        return;
      }
    } catch (e) {
      console.log(`❌ Failed to read ${url}`);
    } finally {
      await prisma.$disconnect();
    }
  }
  console.log("❌ Could not find the user in any known database location.");
}

hunt();

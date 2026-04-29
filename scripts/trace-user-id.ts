import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("\n=== TRACKING USER ID MISMATCH ===\n");

  // 1. Cek semua user dengan email budi.santoso
  console.log("📋 Users with email 'budi.santoso@learnify.id':");
  const budisUsers = await db.user.findMany({
    where: { email: "budi.santoso@learnify.id" },
    select: { id: true, email: true, name: true, createdDate: true }
  });
  console.log(`Found ${budisUsers.length} user(s):`);
  budisUsers.forEach((u, i) => {
    console.log(`  ${i+1}. ID: ${u.id}`);
    console.log(`     Created: ${u.createdDate}`);
  });

  // 2. Cek sessions dan lihat user ID mereka
  console.log("\n📊 Sessions in database:");
  const sessions = await db.session.findMany({
    select: { userId: true, token: true, expiresAt: true, createdDate: true }
  });
  if (sessions.length === 0) {
    console.log("  (no sessions)");
  } else {
    sessions.forEach((s, i) => {
      console.log(`  ${i+1}. User ID: ${s.userId}`);
      console.log(`     Token: ${s.token.substring(0, 20)}...`);
      console.log(`     Created: ${s.createdDate}`);
      console.log(`     Expires: ${s.expiresAt}`);
    });
  }

  // 3. Cek apakah session user IDs ada di database
  console.log("\n🔍 Validating session user IDs:");
  for (const session of sessions) {
    const user = await db.user.findUnique({
      where: { id: session.userId }
    });
    if (user) {
      console.log(`  ✅ ${session.userId} → Found: ${user.email}`);
    } else {
      console.log(`  ❌ ${session.userId} → NOT FOUND in database!`);
    }
  }

  // 4. Seed user ID
  console.log("\n📌 Seed User IDs:");
  console.log("  - instructor-001 (Budi Santoso)");
  console.log("  - instructor-002 (Sari Dewi)");

  console.log("\n=== CONCLUSION ===");
  if (sessions.length > 0 && sessions[0].userId !== "instructor-001" && sessions[0].userId !== "instructor-002") {
    console.log("⚠️  MISMATCH DETECTED!");
    console.log("   Better Auth generated NEW user ID during login");
    console.log("   This is why dashboard can't find the user!");
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));

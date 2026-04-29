import bcrypt from "bcrypt";
import { db } from "@/lib/db";

async function testLogin() {
  console.log("\n=== TESTING LOGIN MANUALLY ===\n");

  const email = "budi.santoso@learnify.id";
  const plainPassword = "Instructor2026!";

  try {
    // 1. Find user
    console.log(`1️⃣ Finding user by email: ${email}`);
    const user = await db.user.findUnique({
      where: { email },
      include: { accounts: true }
    });

    if (!user) {
      console.error("❌ User NOT found in database");
      return;
    }
    console.log(`✅ User found: ${user.name} (ID: ${user.id})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role ID: ${user.roleId}`);

    // 2. Find credential account
    console.log(`\n2️⃣ Finding credential account...`);
    const credentialAccount = user.accounts.find(a => a.providerId === "credential");
    
    if (!credentialAccount) {
      console.error("❌ No credential account found");
      console.log("   Available accounts:", user.accounts.map(a => a.providerId));
      return;
    }
    console.log(`✅ Credential account found`);

    // 3. Check password
    console.log(`\n3️⃣ Checking password...`);
    if (!credentialAccount.password) {
      console.error("❌ No password hash in account");
      return;
    }
    console.log(`✅ Password hash exists`);

    // 4. Verify password
    console.log(`\n4️⃣ Verifying password with bcrypt...`);
    const isPasswordValid = await bcrypt.compare(plainPassword, credentialAccount.password);
    
    if (isPasswordValid) {
      console.log(`✅ PASSWORD VERIFIED! Login should work!`);
    } else {
      console.error(`❌ PASSWORD MISMATCH`);
      console.log(`   Input: ${plainPassword}`);
      console.log(`   Hash: ${credentialAccount.password.substring(0, 30)}...`);
    }

  } catch (err) {
    console.error("\n❌ ERROR:", err);
    if (err instanceof Error) {
      console.error("   Message:", err.message);
    }
  }
}

testLogin().finally(() => process.exit(0));

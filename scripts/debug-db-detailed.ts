import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("\n=== DETAILED AUTH DEBUG ===\n");

  // 1. Check users
  console.log("📋 Users:");
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      name: true, 
      email: true, 
      emailVerified: true,
      roleId: true 
    }
  });
  console.log(JSON.stringify(users, null, 2));

  // 2. Check accounts
  console.log("\n\n🔑 Accounts (Credentials):");
  const accounts = await prisma.account.findMany({
    where: { providerId: 'credential' },
    select: { 
      id: true,
      userId: true, 
      accountId: true,
      providerId: true,
      password: true
    }
  });
  console.log(JSON.stringify(accounts, null, 2));

  // 3. Test finding user by email directly
  console.log("\n\n🔍 Direct query - Find user by email:");
  const userByEmail = await prisma.user.findUnique({
    where: { email: 'budi.santoso@learnify.id' }
  });
  console.log(userByEmail ? `✓ Found: ${userByEmail.name}` : '✗ NOT FOUND');

  // 4. Check if account exists for that user
  if (userByEmail) {
    console.log("\n📊 Account for this user:");
    const userAccounts = await prisma.account.findMany({
      where: { userId: userByEmail.id }
    });
    console.log(JSON.stringify(userAccounts, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

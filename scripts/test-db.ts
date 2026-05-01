import { db } from "@/lib/db";

async function test() {
  try {
    await db.$connect();
    console.log('Connected!');
    
    const users = await db.user.findMany({ 
      select: { id: true, email: true, roleId: true } 
    });
    console.log('Users:', users);
  } catch (e: any) {
    console.error('Error:', e.message);
  } finally {
    await db.$disconnect();
    process.exit(0);
  }
}

test();
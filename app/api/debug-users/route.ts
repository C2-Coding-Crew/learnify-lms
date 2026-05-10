import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Tambahkan listener untuk semua Prisma events
    const users = await db.user.findMany({
      orderBy: { createdDate: 'desc' },
    });
    
    const accounts = await db.account.findMany({
      orderBy: { createdDate: 'desc' },
      take: 10,
    });
    
    const sessions = await db.session.findMany({
      orderBy: { createdDate: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      userCount: users.length,
      accountCount: accounts.length,
      sessionCount: sessions.length,
      users: users.map(u => ({ id: u.id, email: u.email, roleId: u.roleId })),
      accounts: accounts.map(a => ({ id: a.id, userId: a.userId, provider: a.providerId })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack?.substring(0, 500) }, { status: 500 });
  }
}

export async function POST() {
  // Test manual insert via API 
  try {
    const testId = 'api-test-' + Date.now();
    const created = await db.user.create({
      data: {
        id: testId,
        name: 'API Test',
        email: `apitest-${Date.now()}@test.com`,
        emailVerified: false,
        roleId: 2,
      }
    });
    
    // Immediately read it back
    const found = await db.user.findUnique({ where: { id: testId } });
    
    // Cleanup
    await db.user.delete({ where: { id: testId } });
    
    return NextResponse.json({ 
      message: 'Insert test successful',
      created: created.id,
      foundAfterInsert: !!found,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

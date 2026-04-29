import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const users = await db.user.findMany();
    const sessions = await db.session.findMany();
    const accounts = await db.account.findMany();
    return NextResponse.json({ users, sessions, accounts });
}

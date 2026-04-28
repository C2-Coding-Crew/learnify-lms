import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        // Query Prisma raw, and then query something via Better Auth
        // Let's see what Better Auth adapter actually uses
        const prismaUsers = await db.user.findMany();
        
        return NextResponse.json({ 
            prismaUsers
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}

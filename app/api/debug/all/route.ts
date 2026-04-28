import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const tables = [
        "user", "session", "account", "verification", "twoFactor", "Role"
    ];
    const result: any = {};
    for (const t of tables) {
        try {
            const data = await db.$queryRawUnsafe(`SELECT * FROM "${t}"`);
            result[t] = data;
        } catch (e: any) {
            result[t] = e.message;
        }
    }
    return NextResponse.json(result);
}

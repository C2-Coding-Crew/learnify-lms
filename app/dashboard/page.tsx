import { auth } from "@/lib/auth"; 
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function DashboardRootPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/auth/login");
    }

    // ── Penanganan 2FA ──────────────────────────────────────────────────────
    if (session.user.twoFactorEnabled) {
        const isVerified = (await cookies()).get("2fa_verified")?.value === "true";
        if (!isVerified) {
            redirect("/auth/two-factor");
        }
    }

    // ── Cek dan Promosikan Google User ke Admin secara instan ────────────────
    const googleAccount = await db.account.findFirst({
        where: { userId: session.user.id, providerId: "google" }
    });

    let roleId = 3; // Default Student

    if (googleAccount) {
        // Jika login Google, paksa jadi Admin (1)
        roleId = 1;
        // Update di background jika di DB belum 1
        const currentUser = await db.user.findUnique({ where: { id: session.user.id }, select: { roleId: true } });
        if (currentUser?.roleId !== 1) {
            await db.user.update({
                where: { id: session.user.id },
                data: { roleId: 1 }
            });
        }
    } else {
        // Jika bukan Google, ambil role dari DB seperti biasa
        const dbUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: { roleId: true }
        });
        roleId = dbUser?.roleId || 3;
    }

    // ── Redirect berdasarkan role ───────────────────────────────────────────
    if (roleId === 1) {
        redirect("/dashboard/admin");
    } else if (roleId === 2) {
        redirect("/dashboard/instructor");
    } else {
        redirect("/dashboard/student");
    }
}

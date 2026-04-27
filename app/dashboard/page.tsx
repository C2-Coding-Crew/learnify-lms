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

    let roleId = 2; // Default Student

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdminEmail = adminEmail && session.user.email === adminEmail;

    if (googleAccount || isAdminEmail) {
        // Jika login Google atau email terdaftar sebagai admin, paksa jadi Admin (1)
        roleId = 1;
        // Update di DB jika belum 1
        const currentUser = await db.user.findUnique({ where: { id: session.user.id }, select: { roleId: true } });
        if (currentUser?.roleId !== 1) {
            await db.user.update({
                where: { id: session.user.id },
                data: { roleId: 1 }
            });
        }
    } else {
        // Jika bukan Admin, ambil role dari DB seperti biasa
        const dbUser = await db.user.findUnique({
            where: { id: session.user.id },
            select: { roleId: true }
        });
        roleId = dbUser?.roleId || 2;
    }

    // ── Redirect berdasarkan role ───────────────────────────────────────────
    if (roleId === 1) {
        redirect("/dashboard/admin");
    } else if (roleId === 3) {
        redirect("/dashboard/instructor");
    } else {
        redirect("/dashboard/student");
    }
}

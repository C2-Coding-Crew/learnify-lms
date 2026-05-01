import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function DashboardRootPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // DEBUG
    console.log("[dashboard] Session:", session ? `User: ${session.user.id} (${session.user.email})` : "NO SESSION");

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

    // ── Redirect berdasarkan role ───────────────────────────────────────────
    console.log("[dashboard] Finding user in DB:", session.user.id);
    const dbUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { roleId: true, email: true, name: true }
    });

    // DEBUG
    console.log("[dashboard] DB query result:", dbUser ? `Found: ${dbUser.name} (role: ${dbUser.roleId})` : "USER NOT FOUND IN DB!");

    if (!dbUser) {
        console.warn("[dashboard] Invalid session → forcing logout");

        // hapus session manual (Better Auth) via route khusus
        redirect("/api/auth/force-logout");
    }

    const roleId = dbUser.roleId;

    if (roleId === 1) {
        redirect("/dashboard/admin");
    } else if (roleId === 2) {
        redirect("/dashboard/instructor");
    } else if (roleId === 3) {
        redirect("/dashboard/student");
    } else {
        redirect("/auth/select-role");
    }
}

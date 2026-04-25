import { auth } from "@/lib/auth"; 
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function DashboardRootPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    console.log("DEBUG DashboardRootPage session:", JSON.stringify(session, null, 2));

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
    const dbUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { roleId: true }
    });

    console.log("DEBUG DashboardRootPage dbUser:", JSON.stringify(dbUser, null, 2));

    if (!dbUser) {
        // Jika data user hilang di DB, paksa login ulang
        redirect("/auth/login");
    }

    const roleId = dbUser.roleId;
    
    if (roleId === 1) {
        redirect("/dashboard/admin");
    } else if (roleId === 3) {
        redirect("/dashboard/instructor");
    } else {
        redirect("/dashboard/student");
    }
}

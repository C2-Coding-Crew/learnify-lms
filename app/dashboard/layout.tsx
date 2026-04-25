import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // ── Penanganan OAuth Bypass 2FA ──────────────────────────────────────────
  // Karena Better Auth v1 memiliki bug yang by-pass 2FA untuk OAuth Login,
  // mereka memberikan akses session penuh. Kita menggunakan custom cookie
  // `2fa_verified` pada route handler untuk melacak jika mereka benar-benar
  // melewati verifikasi.
  // ─────────────────────────────────────────────────────────────────────────
  if (session.user.twoFactorEnabled) {
    const isVerified = (await cookies()).get("2fa_verified")?.value === "true";
    if (!isVerified) {
      // Jika mereka punya Session tetapi belum diverifikasi 2FA-nya di sesi ini
      redirect("/auth/two-factor");
    }
  }

  return <>{children}</>;
}

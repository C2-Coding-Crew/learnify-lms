import TwoFactorSettings from "@/components/settings/two-factor-settings";

export const metadata = {
  title: "Keamanan Akun — Learnify LMS",
  description: "Kelola pengaturan keamanan akun kamu termasuk 2FA.",
};

export default function SecuritySettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Keamanan Akun</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola pengaturan keamanan untuk melindungi akunmu.
          </p>
        </div>
        <TwoFactorSettings />
      </div>
    </div>
  );
}

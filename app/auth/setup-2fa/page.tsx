import TwoFactorSettings from "@/components/settings/two-factor-settings";

export const metadata = {
  title: "Setup 2FA — Learnify LMS",
  description: "Atur autentikasi dua faktor untuk keamanan akun.",
};

export default function Setup2FAPage() {
  return <TwoFactorSettings />;
}
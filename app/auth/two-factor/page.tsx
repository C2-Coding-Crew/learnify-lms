import TwoFactorVerifyPage from "@/components/two-factor/two-factor-verify";

export const metadata = {
  title: "Verifikasi 2FA — Learnify LMS",
  description: "Masukkan kode dari aplikasi Authenticator untuk masuk.",
};

export default function TwoFactor() {
  return <TwoFactorVerifyPage />;
}

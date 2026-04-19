import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/lib/db";
import { sendEmail, resetPasswordEmailTemplate, twoFactorOtpEmailTemplate } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,

    // ── Forgot Password ──────────────────────────────────────────────────────
    sendResetPassword: async ({ user, url }) => {
      console.log(`\n🔐 [RESET PASSWORD] Mengirim email ke: ${user.email}`);
      console.log(`   Reset URL: ${url}\n`);
      await sendEmail({
        to: user.email,
        subject: "🔐 Reset Password — Learnify LMS",
        html: resetPasswordEmailTemplate(url, user.name),
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24,
  },
  user: {
    // ── Map Better Auth field names → nama field di schema kita ──────────────
    fields: {
      createdAt: "createdDate",
      updatedAt: "lastUpdatedDate",
    },
  },
  // ── Google OAuth ────────────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // ── Two-Factor Authentication (TOTP) ────────────────────────────────────────
  plugins: [
    twoFactor({
      issuer: "Learnify LMS",   // Nama yang tampil di aplikasi Authenticator
      allowPasswordless: true,  // Izinkan user Google OAuth (tanpa password) aktifkan 2FA
      totpOptions: {
        digits: 6,              // Kode 6 digit (standar)
        period: 30,             // Berubah setiap 30 detik (standar TOTP RFC 6238)
      },
      // ── Email OTP: dikirim saat user memilih "Kode via Email" ─────────────────
      sendOTP: async ({ user, otp }: { user: { email: string; name: string }; otp: string }) => {
        console.log(`\n🔒 [2FA OTP] Mengirim kode OTP ke: ${user.email}`);
        await sendEmail({
          to: user.email,
          subject: "🔒 Kode Verifikasi Login — Learnify LMS",
          html: twoFactorOtpEmailTemplate(otp, user.name),
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

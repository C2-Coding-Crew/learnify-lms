// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  // ── Database Hooks ──────────────────────────────────────────────────────────
  // Inject roleId saat user dibuat pertama kali.
  // PENTING: Gunakan `before` hook (bukan `after`) — karena `after` hook
  // dipanggil via queueAfterTransactionHook yang async, dan pada saat itu
  // INSERT sudah committed. Menggunakan `before` jauh lebih aman.
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const adminEmail = process.env.ADMIN_EMAIL;
          const roleId = adminEmail && userData.email === adminEmail ? 1 : 2;
          console.log("[auth] user.create.before → assigning roleId:", roleId, "to", userData.email);
          return {
            data: {
              ...userData,
              roleId,
            },
          };
        },
      },
    },
  },

  events: {
    session: {
      created: async (data: any) => {
        try {
          // Fix roleId admin jika login Google (user sudah ada) tapi roleId belum 1
          const adminEmail = process.env.ADMIN_EMAIL;
          if (adminEmail && data.user.email === adminEmail && (data.user as any).roleId !== 1) {
            await db.user.update({
              where: { id: data.user.id },
              data: { roleId: 1 },
            });
            console.log("[auth] Admin roleId fixed for:", data.user.email);
          }
        } catch (err) {
          console.error("[auth] session.created event error:", err);
        }
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  plugins: [
    twoFactor({
      allowPasswordless: true,
      otpOptions: {
        async sendOTP({ user, otp }) {
          // Import utility email di dalam fungsi atau di bagian atas file
          const { sendEmail, twoFactorOtpEmailTemplate } = await import("@/lib/email");
          const html = twoFactorOtpEmailTemplate(otp, user.name || "Pengguna");
          await sendEmail({
            to: user.email,
            subject: "Kode Verifikasi Login Learnify",
            html: html,
          });
        },
      },
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24,      // refresh setiap 1 hari
    // Tidak perlu fields mapping karena sudah pakai @map di schema.prisma
  },

  account: {
    accountLinking: {
      enabled: true,
    },
    // Tidak perlu fields mapping karena sudah pakai @map di schema.prisma
  },

  user: {
    additionalFields: {
      roleId: {
        type: "number",
        required: false,
      },
      companyCode: {
        type: "string",
        required: false,
      },
      status: {
        type: "number",
        required: false,
      },
      isDeleted: {
        type: "number",
        required: false,
      },
      createdBy: {
        type: "string",
        required: false,
      },
    },
    // Tidak perlu fields mapping karena sudah pakai @map di schema.prisma
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

declare global {
  namespace BetterAuth {
    interface User {
      role?: 1 | 2 | 3;
      twoFactorEnabled?: boolean | null;
    }
  }
}

export type Session = typeof auth.$Infer.Session;
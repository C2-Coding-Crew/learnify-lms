// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  // Pastikan adapter prisma terpasang agar konek ke DB lo
  adapter: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "https://learnify-lms-one.vercel.app",
    "http://localhost:3000",
    "learnify-lms-one.vercel.app"
  ],
  trustHost: true,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },


  events: {
    user: {
      created: async (data: any) => {
        // Set role default to Student (3) unless admin email
        const adminEmail = process.env.ADMIN_EMAIL;
        const isAdminEmail = adminEmail && data.user.email === adminEmail;
        const roleId = isAdminEmail ? 1 : 3;
        await db.user.update({
          where: { id: data.user.id },
          data: { roleId },
        });
      },
    },
    session: {
      created: async (data: any) => {
        const adminEmail = process.env.ADMIN_EMAIL;
        const isAdminEmail = adminEmail && data.user.email === adminEmail;

        if (isAdminEmail) {
          await db.user.update({
            where: { id: data.user.id },
            data: { roleId: 1 },
          });
        }
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // Tambahkan plugin twoFactor di sini biar fiturnya aktif
  plugins: [
    twoFactor({
      allowPasswordless: true, // Izinkan user Google (tanpa credential) aktifkan 2FA tanpa password
    }),
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24,      // refresh setiap 1 hari
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    fields: {
      createdAt: "createdDate",
      updatedAt: "lastUpdatedDate",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
    },
    fields: {
      createdAt: "createdDate",
      updatedAt: "lastUpdatedDate",
    },
  },

  user: {
    additionalFields: {
      roleId: {
        type: "number",
        required: false,
      },
      twoFactorEnabled: {
        type: "boolean",
        required: false,
      },
    },
    fields: {
      createdAt: "createdDate",
      updatedAt: "lastUpdatedDate",
    },
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
      roleId?: number | null;
      twoFactorEnabled?: boolean | null;
    }
  }
}

export type Session = typeof auth.$Infer.Session;
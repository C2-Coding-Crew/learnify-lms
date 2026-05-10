// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === "production" ? "https://learnify-lms-one.vercel.app" : "http://localhost:3000"),
  trustedOrigins: [
    "https://learnify-lms-one.vercel.app",
    "http://localhost:3000",
  ],
  trustHost: true,

  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          // 1. Dukung multiple admin email
          const adminEmailsStr = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
          const adminEmails = adminEmailsStr.split(",").map(e => e.trim().toLowerCase());

          // 2. Gunakan roleId dari payload (jika ada), jika tidak biarkan null
          let finalRoleId = userData.roleId;

          // 3. Jika email termasuk admin, paksa jadi Admin (1)
          if (adminEmails.includes(userData.email.toLowerCase())) {
            finalRoleId = 1;
          }

          console.log("[auth] user.create.before → assigning roleId:", finalRoleId, "to", userData.email);
          return {
            data: {
              ...userData,
              roleId: finalRoleId,
            },
          };
        },
      },
      update: {
        before: async (userData, ctx) => {
          // Cast context ke tipe User agar TypeScript mengenali propertinya
          const originalUser = ctx as { roleId?: number; email?: string } | null;

          // Cegah celah keamanan jika user biasa memanggil updateUser({ roleId: 1 })
          if (
            (userData as any).roleId === 1 &&
            originalUser != null &&
            originalUser.roleId !== 1
          ) {
            const adminEmailsStr = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
            const adminEmails = adminEmailsStr.split(",").map(e => e.trim().toLowerCase());
            const originalEmail = originalUser.email ?? "";
            if (!adminEmails.includes(originalEmail.toLowerCase())) {
              console.warn("[auth] SECURITY WARNING: Attempt to escalate role to Admin by", originalEmail);
              return {
                data: {
                  ...userData,
                  roleId: originalUser.roleId, // Kembalikan ke role asli
                },
              };
            }
          }
          return { data: userData };
        }
      }
    },
  },

  events: {
    session: {
      created: async (data: any) => {
        try {
          // Fix roleId admin jika login Google (user sudah ada) tapi roleId belum 1
          const adminEmailsStr = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
          const adminEmails = adminEmailsStr.split(",").map(e => e.trim().toLowerCase());
          const userEmail = data.user?.email?.toLowerCase();

          if (userEmail && adminEmails.includes(userEmail) && (data.user as any).roleId !== 1) {
            await db.user.update({
              where: { id: data.user.id },
              data: { roleId: 1 },
            });
            console.log("[auth] Admin roleId fixed for:", userEmail);
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
    fields: {
      createdAt: "createdDate",
      updatedAt: "lastUpdatedDate",
    },
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
      twoFactorEnabled: {
        type: "boolean",
        required: false,
      },
      points: {
        type: "number",
        required: false,
      },
      streak: {
        type: "number",
        required: false,
      },
      lastStudyDate: {
        type: "date",
        required: false,
      },
    },
  },
  verification: {
    fields: {
      createdAt: "createdDate",
      updatedAt: "lastUpdatedDate",
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
});

declare global {
  namespace BetterAuth {
    interface User {
      roleId?: number | null;
      twoFactorEnabled?: boolean | null;
      companyCode?: string | null;
      status?: number | null;
      isDeleted?: number | null;
      points?: number | null;
      streak?: number | null;
      lastStudyDate?: Date | null;
    }
  }
}

export type Session = typeof auth.$Infer.Session;
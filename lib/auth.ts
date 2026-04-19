// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
    // --- TAMBAHKAN INI (WAJIB) ---
    // Karena di Prisma lo namanya huruf kecil: model user, model session
    modelName: {
      user: "user",
      session: "session",
      account: "account",
      verification: "verification",
    },
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      roleId: {
        type: "number",
        input: true,
        defaultValue: 2,
        map: (value: unknown) => Number(value),
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          // Logika Role ID dari URL
          let finalRoleId = 2; // Default ke Student (2)

          if (context?.request) {
            const url = new URL(context.request.url);
            const roleIdFromUrl = url.searchParams.get("roleId");
            if (roleIdFromUrl) {
              finalRoleId = Number(roleIdFromUrl);
            }
          }

          return {
            data: {
              ...user,
              roleId: finalRoleId, // Paksa isi roleId agar tidak kena Foreign Key Constraint
            },
          };
        },
      },
    },
  },

  plugins: [
    twoFactor({
      issuer: "Learnify",
      disablePasswordValidation: true,
      skipPasswordCheck: true
    }),
  ],
});
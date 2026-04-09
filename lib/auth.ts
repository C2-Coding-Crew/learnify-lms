import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24,      // refresh setiap 1 hari
  },
  user: {
    // ── Map nama field Better Auth → nama field di schema kita ───────────────
    // Better Auth default: createdAt, updatedAt
    // Schema tim kita    : createdDate, lastUpdatedDate
    fields: {
      createdAt: "createdDate",
      updatedAt: "lastUpdatedDate",
    },
    // CATATAN: Tidak pakai additionalFields untuk 'role' karena
    // field 'role' di schema kita adalah FK relation ke tabel Role,
    // bukan String biasa. Assignment roleId dilakukan setelah user dibuat.
  },
});

export type Session = typeof auth.$Infer.Session;

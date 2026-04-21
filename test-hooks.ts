import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./lib/db";

const auth = betterAuth({
  database: prismaAdapter(db, { provider: "sqlite" }),
  hooks: {
    after: async (ctx: any) => {
      console.log("HOOK RAN FOR:", ctx.path || ctx?.request?.url);
    }
  }
});

console.log("Hooks setup successfully");

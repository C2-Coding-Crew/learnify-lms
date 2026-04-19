import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./lib/db.ts";

const auth = betterAuth({
  database: prismaAdapter(db, { provider: "sqlite" }),
  hooks: {
    after: [{
      matcher: (ctx) => {
        console.log("HOOK MATCHED:", ctx.path);
        return true;
      },
      handler: async (ctx) => {
        console.log("HOOK RAN FOR:", ctx.path);
      }
    }]
  }
});

console.log("Hooks setup successfully");

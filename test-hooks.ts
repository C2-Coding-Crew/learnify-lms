import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./lib/db";

const auth = betterAuth({
  database: prismaAdapter(db, { provider: "sqlite" }),
});

console.log("Auth setup successfully");

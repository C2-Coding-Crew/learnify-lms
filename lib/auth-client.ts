import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : (process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  plugins: [
    twoFactorClient({
      twoFactorPage: "/auth/two-factor",
    }),
  ],
});



export const { signIn, signUp, signOut, useSession } = authClient;
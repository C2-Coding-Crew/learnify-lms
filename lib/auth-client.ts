import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "https://learnify-lms-one.vercel.app/",
  plugins: [
    twoFactorClient({
      twoFactorPage: "/auth/two-factor",
    }),
  ],
});



export const { signIn, signUp, signOut, useSession } = authClient;
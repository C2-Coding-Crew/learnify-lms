import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [
    twoFactorClient({
      // Redirect ke halaman ini jika user punya 2FA aktif saat login
      twoFactorPage: "/auth/two-factor",
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

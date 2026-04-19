import { twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  user: {
    additionalFields: {
      roleId: {
        type: "number",
      },
    },
  },
plugins: [twoFactorClient()],
});



export const { signIn, signUp, signOut, useSession } = authClient;
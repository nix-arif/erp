import { createAuthClient } from "better-auth/react";
import {
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";

console.log(process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [organizationClient(), lastLoginMethodClient()],
});

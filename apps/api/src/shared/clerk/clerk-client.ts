import { createClerkClient, type ClerkClient } from "@clerk/backend";

let client: ClerkClient | undefined;

/** Lazily created so importing this module never crashes when CLERK_SECRET_KEY isn't set (e.g. lint/build). */
export function getClerkClient(): ClerkClient {
  if (!client) {
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY is not configured");
    }
    client = createClerkClient({ secretKey });
  }
  return client;
}

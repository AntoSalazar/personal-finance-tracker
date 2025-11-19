import { auth } from "./auth";
import { headers } from "next/headers";
import type { Session } from "./auth";

/**
 * Get the current session on the server side
 * This function should only be used in Server Components, Server Actions, or API Routes
 */
export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

/**
 * Require authentication - throws an error if user is not authenticated
 * Use this in protected routes
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized - Please sign in to continue");
  }

  return session;
}

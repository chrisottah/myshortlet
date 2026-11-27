// lib/auth/guards.ts
// Every server action and server page MUST go through one of these functions
// to get the current user. Never read a user id from a form field.

import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "./session";
import type { Role } from "@prisma/client";

const ROLE_HOME: Record<Role, string> = {
  investor: "/dashboard",
  property_owner: "/partner/dashboard",
  admin: "/admin",
};

/** Redirect to /login if there is no valid session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Require one of the given roles, else redirect to the user's own home. */
export async function requireRole(...allowed: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowed.includes(user.role)) {
    redirect(ROLE_HOME[user.role]);
  }
  return user;
}

/**
 * Throw if the given resource does not belong to the given user.
 * Use inside a try/catch where the caller decides how to respond;
 * or use assertOwnershipOr404 for a 404 redirect.
 */
export function assertOwnership(resourceOwnerId: string, user: SessionUser) {
  if (resourceOwnerId !== user.id) {
    throw new Error("Forbidden: resource does not belong to this user");
  }
}
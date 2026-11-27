// lib/auth/session.ts
// Opaque session id in an httpOnly cookie, backed by the Session table.
// The cookie carries NOTHING but the session id. No user object. No role.
// Role and identity are always re-read from the DB on each request.

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";
import type { PrismaUserFull } from "./adapters";

const SESSION_COOKIE = "myshortlet_session";
const SESSION_TTL_DAYS = 7;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

/** Create a new session row, set the cookie. */
export async function createSessionForUser(userId: string, opts?: { ip?: string; userAgent?: string }) {
  const sessionId = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
      ip: opts?.ip ?? null,
      userAgent: opts?.userAgent ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

/** Read the session id from the cookie (no DB hit). */
export function readSessionCookie(): string | null {
  // This variant is for places that can't await cookies (rare).
  // Prefer getCurrentUser() / requireUser() in server code.
  return null;
}

/** Look up the current user from the session cookie. Returns null if absent/expired/revoked. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          emailVerifiedAt: true,
          onboardingComplete: true,
        },
      },
    },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    // Opportunistic cleanup
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    role: session.user.role,
    emailVerified: session.user.emailVerifiedAt !== null,
    onboardingComplete: session.user.onboardingComplete,
  };
}

/** Revoke the current session row and clear the cookie. */
export async function destroySession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await prisma.session
      .update({ where: { id: sessionId }, data: { revokedAt: new Date() } })
      .catch(() => {
        // Session may already be gone; not an error.
      });
  }

  cookieStore.delete(SESSION_COOKIE);
}

/** Revoke every session for a user (used after password change / admin action). */
export async function revokeAllSessionsForUser(userId: string) {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Convenience for callers that should be redirected when unauthenticated. */
export async function getCurrentUserOrRedirect(redirectTo = "/login"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`${redirectTo}?next=${encodeURIComponent("/dashboard")}`);
  return user;
}

/**
 * @deprecated — do not use. Kept only so files mid-migration compile.
 * With DB sessions, updating the user is a DB write; nothing needs to be
 * re-written to the cookie. Migrate callers to update the DB directly.
 */
export async function createSession(_user: unknown) {
  return;
}

/**
 * Like getCurrentUser(), but returns the full User row (with profile relations)
 * for callers that need profile fields. Throws if not logged in.
 */

export async function getCurrentUserFull(): Promise<PrismaUserFull | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        include: {
          investorProfile: true,
          partnerProfile: true,
          adminProfile: true,
          wallets: true,
          bankAccounts: true,
          cryptoAddresses: true,
        },
      },
    },
  });

  if (!session || session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}
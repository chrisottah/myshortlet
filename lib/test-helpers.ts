// lib/test-helpers.ts
// Shared helpers for Vitest suites that need a real User row.
// Also cleans up "test.*" data before each test so a failed run doesn't
// poison the next one.

import { prisma } from "@/lib/db";
import * as argon2 from "argon2";

export async function ensureTestUser(
  userId: string,
  role: "investor" | "property_owner" | "admin" = "investor"
) {
  const passwordHash = await argon2.hash("TestPassword123!");
  return prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: `${userId}@test.local`,
      passwordHash,
      firstName: "Test",
      lastName: "User",
      role,
      emailVerifiedAt: new Date(),
      onboardingComplete: true,
      kycStatus: "verified",
    },
    update: {},
  });
}

export async function cleanupTestUser(userId: string) {
  // Order matters: entries → transactions → accounts → wallet → deposits →
  // withdrawals → user. Also nuke any "real-named" ledger transactions that
  // tests create (deposit.confirm:, withdrawal., investment.) so a prior run
  // never collides on the (reference) unique constraint.
  await prisma.ledgerEntry.deleteMany({
    where: {
      OR: [
        { account: { userId } },
        { transaction: { reference: { startsWith: "test." } } },
        { transaction: { reference: { startsWith: "deposit.confirm:" } } },
        { transaction: { reference: { startsWith: "withdrawal." } } },
        { transaction: { reference: { startsWith: "investment." } } },
      ],
    },
  });
  await prisma.ledgerTransaction.deleteMany({
    where: {
      OR: [
        { entries: { some: { account: { userId } } } },
        { reference: { startsWith: "test." } },
        { reference: { startsWith: "deposit.confirm:" } },
        { reference: { startsWith: "withdrawal." } },
        { reference: { startsWith: "investment." } },
      ],
    },
  });
  await prisma.ledgerAccount.deleteMany({ where: { userId } });
  await prisma.wallet.deleteMany({ where: { userId } });
  await prisma.deposit.deleteMany({ where: { userId } });
  await prisma.withdrawal.deleteMany({ where: { userId } });
  await prisma.idempotencyKey.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
}

/**
 * Wipe any leftover test.* transactions, even from prior failed runs.
 * Call this once in beforeAll of a test file that touches the ledger.
 */
export async function purgeTestLedger() {
  await prisma.ledgerEntry.deleteMany({
    where: { transaction: { reference: { startsWith: "test." } } },
  });
  await prisma.ledgerTransaction.deleteMany({
    where: { reference: { startsWith: "test." } },
  });
}
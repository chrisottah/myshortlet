// lib/services/payment-service.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { paymentService } from "./payment-service";
import { walletService } from "./wallet-service";
import { ensureTestUser, cleanupTestUser } from "@/lib/test-helpers";

const USER = "test_payment_user_01";
const DEPOSIT_ID = "test_dep_01";

describe("paymentService.confirmDeposit", () => {
  beforeEach(async () => {
    // Explicit cleanup scoped to this deposit, so a prior failed run can't
    // collide on the (reference) unique constraint.
    await prisma.ledgerEntry.deleteMany({
      where: {
        transaction: { reference: { startsWith: `deposit.confirm:${DEPOSIT_ID}` } },
      },
    });
    await prisma.ledgerTransaction.deleteMany({
      where: { reference: { startsWith: `deposit.confirm:${DEPOSIT_ID}` } },
    });
    await prisma.idempotencyKey.deleteMany({
      where: { key: `deposit.confirm:${DEPOSIT_ID}` },
    });
    await prisma.auditLog.deleteMany({
      where: { action: "deposit.confirmed", targetId: DEPOSIT_ID },
    });

    await cleanupTestUser(USER);
    await ensureTestUser(USER);
    await prisma.deposit.deleteMany({ where: { id: DEPOSIT_ID } });

    await walletService.createWallet(USER);
    await prisma.deposit.create({
      data: {
        id: DEPOSIT_ID,
        userId: USER,
        method: "bank_transfer",
        amountKobo: 1_000_000n,
        status: "pending",
        idempotencyKey: `test-dep-${DEPOSIT_ID}`,
      },
    });
  });

  it("credits the wallet exactly once, even when called twice", async () => {
    await paymentService.confirmDeposit(DEPOSIT_ID, "user_admin_01");
    await paymentService.confirmDeposit(DEPOSIT_ID, "user_admin_01"); // idempotent

    const w = await walletService.getWalletByUserId(USER);
    expect(w?.availableBalance).toBe(1_000_000n);

    const deposit = await prisma.deposit.findUniqueOrThrow({ where: { id: DEPOSIT_ID } });
    expect(deposit.status).toBe("confirmed");
  });
});
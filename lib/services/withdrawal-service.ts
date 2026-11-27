// lib/services/withdrawal-service.ts
// Prisma-backed. Withdrawal lifecycle:
//   request  → hold funds (debit available, hold in wallet.held)
//   complete → pay out (debit wallet.held, credit payouts)
//   reject   → release hold (credit wallet.available back)
//
// B4 will add: destination validation (saved bank/crypto account, name match,
// crypto cooling period), maker–checker approval, provider adapters, rate locks.

import { prisma } from "@/lib/db";
import { postLedgerTransaction } from "@/lib/ledger/post";
import { ACCOUNT } from "@/lib/ledger/accounts";
import { nairaToKobo } from "@/lib/money";

type PaymentMethod = "bank_transfer" | "crypto";

interface WithdrawalInput {
  userId: string;
  amount: number;
  method: PaymentMethod;
  destinationBank?: string;
  destinationWalletAddress?: string;
}

export const withdrawalService = {
  async getAll() {
    return prisma.withdrawal.findMany({ orderBy: { createdAt: "desc" } });
  },

  async getByUserId(userId: string) {
    return prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPending() {
    return prisma.withdrawal.findMany({
      where: { status: { in: ["requested", "approved", "processing"] } },
      orderBy: { createdAt: "desc" },
    });
  },

  async requestWithdrawal(input: WithdrawalInput) {
    const amountKobo = nairaToKobo(input.amount);

    const wallet = await prisma.wallet.findUnique({ where: { userId: input.userId } });
    if (!wallet || wallet.availableBalance < amountKobo) {
      throw new Error("Insufficient available balance");
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: input.userId,
        method: input.method,
        amountKobo,
        status: "requested",
        idempotencyKey: `withdrawal.request:${input.userId}:${Date.now()}`,
        destinationSnapshot: (input.destinationBank
          ? { bankName: input.destinationBank }
          : { walletAddress: input.destinationWalletAddress }) as never,
      },
    });

    await prisma.$transaction(async (tx) => {
      await postLedgerTransaction(tx, {
        reference: `withdrawal.hold:${withdrawal.id}`,
        kind: "withdrawal.hold",
        description: `Withdrawal hold (${input.method})`,
        meta: { withdrawalId: withdrawal.id },
        entries: [
          { code: ACCOUNT.WALLET_AVAILABLE, userId: input.userId, amountKobo: -amountKobo },
          { code: ACCOUNT.WALLET_HELD, userId: input.userId, amountKobo },
        ],
      });
    });

    return withdrawal;
  },

  async completeWithdrawal(withdrawalId: string, actorId?: string) {
    const withdrawal = await prisma.withdrawal.findUniqueOrThrow({
      where: { id: withdrawalId },
    });
    if (withdrawal.status !== "requested" && withdrawal.status !== "processing") {
      throw new Error(`Cannot complete withdrawal in status ${withdrawal.status}`);
    }

    await prisma.$transaction(async (tx) => {
      await postLedgerTransaction(tx, {
        reference: `withdrawal.complete:${withdrawal.id}`,
        kind: "withdrawal.complete",
        description: `Withdrawal paid out (${withdrawal.method})`,
        meta: { withdrawalId: withdrawal.id },
        entries: [
          { code: ACCOUNT.WALLET_HELD, userId: withdrawal.userId, amountKobo: -withdrawal.amountKobo },
          { code: ACCOUNT.PAYOUTS, amountKobo: withdrawal.amountKobo },
        ],
      });
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "completed", approvingAdminId: actorId ?? null },
      });
    });

    return prisma.withdrawal.findUniqueOrThrow({ where: { id: withdrawalId } });
  },

  async rejectWithdrawal(withdrawalId: string, actorId?: string) {
    const withdrawal = await prisma.withdrawal.findUniqueOrThrow({
      where: { id: withdrawalId },
    });
    if (withdrawal.status !== "requested" && withdrawal.status !== "processing") {
      throw new Error(`Cannot reject withdrawal in status ${withdrawal.status}`);
    }

    await prisma.$transaction(async (tx) => {
      await postLedgerTransaction(tx, {
        reference: `withdrawal.refund:${withdrawal.id}`,
        kind: "withdrawal.refund",
        description: "Withdrawal rejected, funds released",
        meta: { withdrawalId: withdrawal.id },
        entries: [
          { code: ACCOUNT.WALLET_HELD, userId: withdrawal.userId, amountKobo: -withdrawal.amountKobo },
          { code: ACCOUNT.WALLET_AVAILABLE, userId: withdrawal.userId, amountKobo: withdrawal.amountKobo },
        ],
      });
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "rejected", approvingAdminId: actorId ?? null },
      });
    });

    return prisma.withdrawal.findUniqueOrThrow({ where: { id: withdrawalId } });
  },

  /**
   * @deprecated Mock-only. Kept so lib/mock-data/seed.ts compiles.
   */
  async seedWithdrawals(_items: unknown[]): Promise<void> {
    throw new Error(
      "withdrawalService.seedWithdrawals is deprecated; use prisma/seed.ts."
    );
  },
};
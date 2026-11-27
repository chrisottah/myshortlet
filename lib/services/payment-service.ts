// lib/services/payment-service.ts
// Ported to Prisma + ledger + idempotency. Same public function names.

import { prisma } from "@/lib/db";
import { withIdempotency } from "@/lib/idempotency";
import { postLedgerTransaction } from "@/lib/ledger/post";
import { ACCOUNT } from "@/lib/ledger/accounts";
import { writeAuditInTx } from "@/lib/audit/log";

export const paymentService = {
  async getAll() {
    return prisma.deposit.findMany({ orderBy: { createdAt: "desc" } });
  },

  async getByUserId(userId: string) {
    return prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getPending() {
    return prisma.deposit.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Confirm a deposit. Idempotent on the deposit id.
   * Credits the user's available wallet via the ledger, once.
   */
  async confirmDeposit(depositId: string, actorId?: string) {
    return withIdempotency(
      { scope: "deposit.confirm", key: depositId },
      async (tx) => {
        const deposit = await tx.deposit.findUniqueOrThrow({ where: { id: depositId } });

        if (deposit.status === "confirmed") {
          return { depositId, alreadyConfirmed: true as const };
        }
        if (deposit.status !== "pending") {
          throw new Error(`Cannot confirm deposit in status ${deposit.status}`);
        }

        await postLedgerTransaction(tx, {
          reference: `deposit.confirm:${deposit.id}`,
          kind: "deposit.confirm",
          description: `Deposit confirmed (${deposit.method})`,
          meta: { depositId: deposit.id, createdById: actorId },
          entries: [
            { code: ACCOUNT.DEPOSITS_DESIGNATED, amountKobo: -deposit.amountKobo },
            { code: ACCOUNT.WALLET_AVAILABLE, userId: deposit.userId, amountKobo: deposit.amountKobo },
          ],
        });

        await tx.deposit.update({
          where: { id: deposit.id },
          data: { status: "confirmed", confirmedAt: new Date() },
        });

        await writeAuditInTx(tx, {
          actorId: actorId ?? null,
          actorRole: actorId ? "admin" : "system",
          action: "deposit.confirmed",
          targetType: "Deposit",
          targetId: deposit.id,
          before: { status: deposit.status },
          after: { status: "confirmed", amountKobo: deposit.amountKobo.toString() },
        });

        return { depositId, alreadyConfirmed: false as const };
      }
    );
  },

  async rejectDeposit(depositId: string, actorId?: string) {
    return withIdempotency(
      { scope: "deposit.reject", key: depositId },
      async (tx) => {
        const deposit = await tx.deposit.findUniqueOrThrow({ where: { id: depositId } });
        if (deposit.status !== "pending") {
          throw new Error(`Cannot reject deposit in status ${deposit.status}`);
        }
        await tx.deposit.update({
          where: { id: deposit.id },
          data: { status: "failed" },
        });
        await writeAuditInTx(tx, {
          actorId: actorId ?? null,
          actorRole: actorId ? "admin" : "system",
          action: "deposit.rejected",
          targetType: "Deposit",
          targetId: deposit.id,
          before: { status: deposit.status },
          after: { status: "failed" },
        });
        return { depositId, rejected: true as const };
      }
    );
  },

  async initiateBankDeposit(input: {
    userId: string;
    amountKobo: bigint;
    bankReference: string;
  }) {
    return prisma.deposit.create({
      data: {
        userId: input.userId,
        method: "bank_transfer",
        amountKobo: input.amountKobo,
        status: "pending",
        bankReference: input.bankReference,
        idempotencyKey: `deposit.bank:${input.userId}:${input.bankReference}`,
      },
    });
  },

  async initiateCryptoDeposit(input: {
    userId: string;
    amountKobo: bigint;
    cryptoAsset: "USDT" | "USDC" | "BTC" | "ETH";
    cryptoNetwork: string;
    cryptoTxHash: string;
  }) {
    return prisma.deposit.create({
      data: {
        userId: input.userId,
        method: "crypto",
        amountKobo: input.amountKobo,
        status: "pending",
        cryptoAsset: input.cryptoAsset,
        cryptoNetwork: input.cryptoNetwork,
        cryptoTxHash: input.cryptoTxHash,
        idempotencyKey: `deposit.crypto:${input.userId}:${input.cryptoTxHash}`,
      },
    });
  },

  /**
   * @deprecated Mock-only. Kept for lib/mock-data/seed.ts until B7.
   */
  async seedDeposits(_items: unknown[]): Promise<void> {
    throw new Error(
      "paymentService.seedDeposits is deprecated; use prisma/seed.ts."
    );
  },
};
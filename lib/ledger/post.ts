// lib/ledger/post.ts
// The single function that writes money. Every credit, debit, investment,
// maturity payout, withdrawal, and refund goes through here.
//
// Invariants:
//   - Entries must sum to zero (signed amounts, +credit / -debit).
//   - The wallet's cached balances are updated in the same transaction as
//     the ledger entries, so they can never diverge.
//   - All in BigInt kobo.

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ensureAccount, ACCOUNT, type AccountCode } from "./accounts";

export interface LedgerEntryInput {
  code: AccountCode;
  userId?: string;
  /** Signed kobo. Positive = credit (money into the account), negative = debit. */
  amountKobo: bigint;
}

export interface PostLedgerOptions {
  reference: string;
  kind: string; // "deposit.confirm" | "investment.create" | "maturity.payout" | ...
  description?: string;
  entries: LedgerEntryInput[];
  meta?: {
    investmentId?: string;
    depositId?: string;
    withdrawalId?: string;
    createdById?: string;
  };
}

/**
 * Post a balanced ledger transaction and update the affected wallets.
 * Must be called inside a Prisma transaction (with `withIdempotency` or `prisma.$transaction`).
 */
export async function postLedgerTransaction(
  tx: Prisma.TransactionClient,
  opts: PostLedgerOptions
): Promise<{ transactionId: string }> {
  if (opts.entries.length === 0) {
    throw new Error("Ledger transaction must have at least one entry");
  }
  const sum = opts.entries.reduce((s, e) => s + e.amountKobo, 0n);
  if (sum !== 0n) {
    throw new Error(
      `Ledger transaction ${opts.reference} is unbalanced: entries sum to ${sum.toString()}`
    );
  }

  // Resolve account ids (creating per-user accounts on demand).
  const accountIds: string[] = [];
  for (const e of opts.entries) {
    accountIds.push(await ensureAccount(tx, e.code, e.userId));
  }

  // Create the transaction and its entries.
  const txn = await tx.ledgerTransaction.create({
    data: {
      reference: opts.reference,
      kind: opts.kind,
      description: opts.description ?? null,
      investmentId: opts.meta?.investmentId ?? null,
      depositId: opts.meta?.depositId ?? null,
      withdrawalId: opts.meta?.withdrawalId ?? null,
      createdById: opts.meta?.createdById ?? null,
      entries: {
        create: opts.entries.map((e, i) => ({
          accountId: accountIds[i],
          amountKobo: e.amountKobo,
        })),
      },
    },
  });

  // Update the cached wallet balances for every user account that was touched.
  // Group entries by user so we update each wallet once.
  const perUser = new Map<string, { available: bigint; invested: bigint; earnings: bigint; held: bigint }>();
  for (const e of opts.entries) {
    if (!e.userId) continue; // platform account
    if (!perUser.has(e.userId)) {
      perUser.set(e.userId, { available: 0n, invested: 0n, earnings: 0n, held: 0n });
    }
    const w = perUser.get(e.userId)!;
    switch (e.code) {
      case ACCOUNT.WALLET_AVAILABLE: w.available += e.amountKobo; break;
      case ACCOUNT.WALLET_INVESTED:  w.invested  += e.amountKobo; break;
      case ACCOUNT.WALLET_EARNINGS:  w.earnings  += e.amountKobo; break;
      case ACCOUNT.WALLET_HELD:      w.held      += e.amountKobo; break;
      // Non-wallet account touched for a user (shouldn't happen today, but safe)
      default: break;
    }
  }

  for (const [userId, delta] of perUser) {
    if (delta.available === 0n && delta.invested === 0n && delta.earnings === 0n && delta.held === 0n) {
      continue;
    }
    await tx.wallet.upsert({
      where: { userId },
      create: {
        userId,
        availableBalance: delta.available,
        investedBalance: delta.invested,
        earningsBalance: delta.earnings,
        heldBalance: delta.held,
      },
      update: {
        availableBalance: { increment: delta.available },
        investedBalance:  { increment: delta.invested },
        earningsBalance:  { increment: delta.earnings },
        heldBalance:      { increment: delta.held },
      },
    });
  }

  return { transactionId: txn.id };
}

/**
 * Convenience wrapper: run postLedgerTransaction inside its own prisma.$transaction.
 * Use this when the ledger change is the only thing to do. When the ledger
 * change must be atomic with other writes (e.g. confirming a deposit row),
 * call postLedgerTransaction(tx, …) inside the caller's transaction.
 */
export async function postLedgerTransactionStandalone(opts: PostLedgerOptions): Promise<string> {
  const result = await prisma.$transaction(async (tx) => postLedgerTransaction(tx, opts));
  return result.transactionId;
}
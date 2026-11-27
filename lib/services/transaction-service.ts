// lib/services/transaction-service.ts
// Read-model over the ledger. The LedgerTransaction / LedgerEntry tables are
// the source of truth; this service maps them to the frontend `Transaction`
// shape so components don't have to change. Writes to the ledger go through
// lib/ledger/post.ts; this service does not write.

import { prisma } from "@/lib/db";
import type { Transaction, TransactionType, TransactionStatus } from "@/lib/types";

/** Map a LedgerTransaction.kind to the frontend Transaction.type. */
function toFrontendType(kind: string): TransactionType {
  if (kind === "deposit.confirm") return "deposit";
  if (kind === "investment.debit" || kind === "investment.credit") return "investment";
  if (kind === "maturity.payout") return "earning";
  if (kind === "withdrawal.hold" || kind === "withdrawal.complete") return "withdrawal";
  if (kind === "withdrawal.refund") return "refund";
  if (kind === "reinvestment") return "reinvestment";
  return "deposit"; // fallback; ledger kinds we haven't mapped yet
}

/** Ledger transactions are completed by definition. */
const STATUS: TransactionStatus = "completed";

interface LedgerTxnRow {
  id: string;
  reference: string;
  kind: string;
  description: string | null;
  createdAt: Date;
  investmentId: string | null;
  entries: { amountKobo: bigint; account: { userId: string | null } }[];
}

function toFrontend(txn: LedgerTxnRow, userId: string): Transaction | null {
  // Amount = magnitude of this user's wallet movement in the transaction.
  // Positive entries (credits) and negative entries (debits) both count;
  // take the larger magnitude so a "move within own wallet" (e.g. invest)
  // shows the moved amount, not zero.
  let magnitude = 0n;
  for (const e of txn.entries) {
    if (e.account.userId !== userId) continue;
    const abs = e.amountKobo < 0n ? -e.amountKobo : e.amountKobo;
    if (abs > magnitude) magnitude = abs;
  }
  if (magnitude === 0n) return null; // transaction didn't touch this user
  return {
    id: txn.id,
    userId,
    type: toFrontendType(txn.kind),
    amount: Number(magnitude / 100n), // naira, for the frontend Transaction type
    status: STATUS,
    reference: txn.reference,
    relatedInvestmentId: txn.investmentId ?? undefined,
    description: txn.description ?? humanise(txn.kind),
    createdAt: txn.createdAt.toISOString(),
  };
}

function humanise(kind: string): string {
  const map: Record<string, string> = {
    "deposit.confirm": "Deposit confirmed",
    "investment.debit": "Investment funded",
    "investment.credit": "Investment committed",
    "maturity.payout": "Maturity payout",
    "withdrawal.hold": "Withdrawal requested",
    "withdrawal.complete": "Withdrawal paid out",
    "withdrawal.refund": "Withdrawal refunded",
    "reinvestment": "Reinvested at maturity",
  };
  return map[kind] ?? kind;
}

export const transactionService = {
  async getByUserId(userId: string): Promise<Transaction[]> {
    const rows = await prisma.ledgerTransaction.findMany({
      where: {
        entries: { some: { account: { userId } } },
      },
      orderBy: { createdAt: "desc" },
      include: {
        entries: {
          select: {
            amountKobo: true,
            account: { select: { userId: true } },
          },
        },
      },
    });
    return rows
      .map((r) => toFrontend(r, userId))
      .filter((t): t is Transaction => t !== null);
  },

  async getAll(): Promise<Transaction[]> {
    // Admin view: every ledger transaction, attributed to the user who was
    // touched. Used by the audit/reconciliation screens.
    const rows = await prisma.ledgerTransaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        entries: {
          select: {
            amountKobo: true,
            account: { select: { userId: true } },
          },
        },
      },
    });
    const out: Transaction[] = [];
    for (const r of rows) {
      // Take every distinct user id touched in this transaction.
      const userIds = new Set<string>();
      for (const e of r.entries) {
        if (e.account.userId) userIds.add(e.account.userId);
      }
      for (const uid of userIds) {
        const t = toFrontend(r, uid);
        if (t) out.push(t);
      }
    }
    return out;
  },

  /**
   * @deprecated No-op. Writes go through lib/ledger/post.ts now.
   * Kept so existing callers (investmentService, withdrawalService) compile
   * until B2/B3/B4 port them fully.
   */
  record(_input: {
    userId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    relatedInvestmentId?: string;
    description: string;
  }): Transaction {
    // Return a synthetic row so the callers don't crash. It is NOT persisted;
    // the real record is written by postLedgerTransaction when the money moves.
    return {
      id: `txn_pending_${Date.now()}`,
      userId: _input.userId,
      type: _input.type,
      amount: _input.amount,
      status: _input.status,
      reference: `PENDING`,
      relatedInvestmentId: _input.relatedInvestmentId,
      description: _input.description,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * @deprecated No-op. Kept so lib/mock-data/seed.ts (if it ever comes back)
   * compiles.
   */
  seedTransactions(_items: Transaction[]): void {
    // intentionally empty
  },

  /**
   * @deprecated No-op. Status is derived from ledger rows now.
   */
  updateStatus(_id: string, _status: TransactionStatus): void {
    // intentionally empty
  },
};
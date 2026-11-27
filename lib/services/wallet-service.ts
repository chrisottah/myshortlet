// lib/services/wallet-service.ts
// Prisma-backed wallet service. Same function names as before, now DB-backed.
// All balances are BigInt kobo.

// lib/services/wallet-service.ts
// Prisma-backed wallet service. Same function names as before, now DB-backed.
// All balances are BigInt kobo.

import { prisma } from "@/lib/db";
import { postLedgerTransactionStandalone } from "@/lib/ledger/post";
import { ensureAccount, ACCOUNT } from "@/lib/ledger/accounts";

export interface WalletView {
  id: string;
  userId: string;
  currency: string;
  availableBalance: bigint;
  investedBalance: bigint;
  earningsBalance: bigint;
  heldBalance: bigint;
}

export const walletService = {
  async getWalletByUserId(userId: string): Promise<WalletView | null> {
    const w = await prisma.wallet.findUnique({ where: { userId } });
    if (!w) return null;
    return {
      id: w.id,
      userId: w.userId,
      currency: w.currency,
      availableBalance: w.availableBalance,
      investedBalance: w.investedBalance,
      earningsBalance: w.earningsBalance,
      heldBalance: w.heldBalance,
    };
  },

  async createWallet(userId: string): Promise<WalletView> {
    const w = await prisma.$transaction(async (tx) => {
      // Ensure the user's ledger accounts exist alongside the wallet row.
      await ensureAccount(tx, ACCOUNT.WALLET_AVAILABLE, userId);
      await ensureAccount(tx, ACCOUNT.WALLET_INVESTED, userId);
      await ensureAccount(tx, ACCOUNT.WALLET_EARNINGS, userId);
      await ensureAccount(tx, ACCOUNT.WALLET_HELD, userId);
      return tx.wallet.create({ data: { userId, currency: "NGN" } });
    });
    return {
      id: w.id,
      userId: w.userId,
      currency: w.currency,
      availableBalance: w.availableBalance,
      investedBalance: w.investedBalance,
      earningsBalance: w.earningsBalance,
      heldBalance: w.heldBalance,
    };
  },

  async creditAvailable(userId: string, amountKobo: bigint, opts: { reference: string; kind: string; description?: string }): Promise<void> {
    if (amountKobo <= 0n) throw new Error("creditAvailable: amount must be > 0");
    await postLedgerTransactionStandalone({
      reference: opts.reference,
      kind: opts.kind,
      description: opts.description,
      entries: [
        { code: ACCOUNT.DEPOSITS_DESIGNATED, amountKobo: -amountKobo },
        { code: ACCOUNT.WALLET_AVAILABLE, userId, amountKobo },
      ],
    });
  },

  async debitAvailable(userId: string, amountKobo: bigint, opts: { reference: string; kind: string; description?: string }): Promise<void> {
    if (amountKobo <= 0n) throw new Error("debitAvailable: amount must be > 0");
    // Available balance check happens inside the posting transaction by reading the wallet.
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.availableBalance < amountKobo) {
      throw new Error("Insufficient available balance");
    }
    await postLedgerTransactionStandalone({
      reference: opts.reference,
      kind: opts.kind,
      description: opts.description,
      entries: [
        { code: ACCOUNT.WALLET_AVAILABLE, userId, amountKobo: -amountKobo },
        { code: ACCOUNT.PAYOUTS, amountKobo },
      ],
    });
  },

  async creditInvested(userId: string, amountKobo: bigint, opts: { reference: string; kind: string; description?: string }): Promise<void> {
    // Moves between two of the user's own wallet accounts; the total liability
    // to the user is unchanged, so no platform account is touched.
    if (amountKobo <= 0n) throw new Error("creditInvested: amount must be > 0");
    await postLedgerTransactionStandalone({
      reference: opts.reference,
      kind: opts.kind,
      description: opts.description,
      entries: [
        { code: ACCOUNT.WALLET_AVAILABLE, userId, amountKobo: -amountKobo },
        { code: ACCOUNT.WALLET_INVESTED, userId, amountKobo },
      ],
    });
  },

  /**
   * Used when an investment matures: move principal out of invested and
   * earnings out of earnings, credit both to available.
   */
  async debitEarningsAndInvested(userId: string, principalKobo: bigint, earningsKobo: bigint, opts: { reference: string; kind: string; description?: string }): Promise<void> {
    await postLedgerTransactionStandalone({
      reference: opts.reference,
      kind: opts.kind,
      description: opts.description,
      entries: [
        { code: ACCOUNT.WALLET_INVESTED, userId, amountKobo: -principalKobo },
        { code: ACCOUNT.WALLET_EARNINGS, userId, amountKobo: -earningsKobo },
        { code: ACCOUNT.WALLET_AVAILABLE, userId, amountKobo: principalKobo + earningsKobo },
      ],
    });
  },

  async creditEarnings(userId: string, amountKobo: bigint, opts: { reference: string; kind: string; description?: string }): Promise<void> {
    if (amountKobo <= 0n) throw new Error("creditEarnings: amount must be > 0");
    await postLedgerTransactionStandalone({
      reference: opts.reference,
      kind: opts.kind,
      description: opts.description,
      entries: [
        { code: ACCOUNT.ACCRUED_LIABILITY, amountKobo: -amountKobo },
        { code: ACCOUNT.WALLET_EARNINGS, userId, amountKobo },
      ],
    });
  },

  async seedWallets(_items: unknown[]): Promise<void> {
    throw new Error(
      "walletService.seedWallets is deprecated; use prisma/seed.ts."
    );
  },
};
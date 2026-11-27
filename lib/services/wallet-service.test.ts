import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { walletService } from "./wallet-service";
import { ensureTestUser, cleanupTestUser } from "@/lib/test-helpers";

const TEST_USER = "test_wallet_user_01";

describe("walletService", () => {
   beforeEach(async () => {
    await cleanupTestUser(TEST_USER);
    await ensureTestUser(TEST_USER);
  });

  it("creditAvailable credits once and creates the wallet + ledger accounts", async () => {
    // Bootstrap: the createWallet() path creates the wallet row and the four user accounts.
    await walletService.createWallet(TEST_USER);

    await walletService.creditAvailable(TEST_USER, 1_000_000n, {
      reference: `test.credit.${TEST_USER}.1`,
      kind: "test.credit",
    });

    const w = await walletService.getWalletByUserId(TEST_USER);
    expect(w?.availableBalance).toBe(1_000_000n);

    // Reconciliation
    const accounts = await prisma.ledgerAccount.findMany({ where: { userId: TEST_USER } });
    const ids = accounts.map((a) => a.id);
    const entries = await prisma.ledgerEntry.findMany({ where: { accountId: { in: ids } } });
    expect(entries.reduce((s, e) => s + e.amountKobo, 0n)).toBe(1_000_000n);
  });

  it("debitAvailable refuses to go below zero", async () => {
    await walletService.createWallet(TEST_USER);
    await walletService.creditAvailable(TEST_USER, 100n, {
      reference: `test.credit.${TEST_USER}.2`,
      kind: "test.credit",
    });
    await expect(
      walletService.debitAvailable(TEST_USER, 500n, {
        reference: `test.debit.${TEST_USER}.2`,
        kind: "test.debit",
      })
    ).rejects.toThrow(/Insufficient/);
  });

  it("debitEarningsAndInvested moves principal + earnings to available", async () => {
    await walletService.createWallet(TEST_USER);
    await walletService.creditAvailable(TEST_USER, 1_000_000n, {
      reference: `test.credit.${TEST_USER}.3`,
      kind: "test.credit",
    });
    await walletService.creditInvested(TEST_USER, 1_000_000n, {
      reference: `test.invest.${TEST_USER}.3`,
      kind: "test.invest",
    });
    await walletService.debitEarningsAndInvested(TEST_USER, 1_000_000n, 200_000n, {
      reference: `test.mature.${TEST_USER}.3`,
      kind: "test.mature",
    });

    const w = await walletService.getWalletByUserId(TEST_USER);
    // available: 1_000_000 → 0 (credited invested) → +1_200_000 (maturity) = 1_200_000
    // invested: 0 → 1_000_000 → 0
    // earnings: 0 → 0 (nothing credited; earnings would come from creditEarnings before this)
    expect(w?.availableBalance).toBe(1_200_000n);
    expect(w?.investedBalance).toBe(0n);
  });
});
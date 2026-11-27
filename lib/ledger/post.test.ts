import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { postLedgerTransactionStandalone } from "./post";
import { ACCOUNT } from "./accounts";
import { ensureTestUser, cleanupTestUser, purgeTestLedger } from "@/lib/test-helpers";

const TEST_USER = "test_ledger_user_01";
const SUFFIX = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ref = (name: string) => `test.post.${SUFFIX}.${name}`;

describe("postLedgerTransaction", () => {
  beforeEach(async () => {
    await purgeTestLedger();
    await cleanupTestUser(TEST_USER);
    await ensureTestUser(TEST_USER);
  });

  it("rejects unbalanced entries", async () => {
    await expect(
      postLedgerTransactionStandalone({
        reference: ref("unbalanced"),
        kind: "test",
        entries: [
          { code: ACCOUNT.DEPOSITS_DESIGNATED, amountKobo: -100n },
          { code: ACCOUNT.WALLET_AVAILABLE, userId: TEST_USER, amountKobo: 50n },
        ],
      })
    ).rejects.toThrow(/unbalanced/);
  });

  it("posts balanced entries and updates the cached wallet", async () => {
    await postLedgerTransactionStandalone({
      reference: ref("ok"),
      kind: "test",
      entries: [
        { code: ACCOUNT.DEPOSITS_DESIGNATED, amountKobo: -1_000_000n },
        { code: ACCOUNT.WALLET_AVAILABLE, userId: TEST_USER, amountKobo: 1_000_000n },
      ],
    });
    const wallet = await prisma.wallet.findUnique({ where: { userId: TEST_USER } });
    expect(wallet?.availableBalance).toBe(1_000_000n);

    const sum = await prisma.ledgerEntry.aggregate({
      where: { transaction: { reference: ref("ok") } },
      _sum: { amountKobo: true },
    });
    expect(sum._sum.amountKobo).toBe(0n);
  });

  it("reconciliation invariant: cached = sum of ledger entries", async () => {
    await postLedgerTransactionStandalone({
      reference: ref("rec1"),
      kind: "test",
      entries: [
        { code: ACCOUNT.DEPOSITS_DESIGNATED, amountKobo: -5_000_000n },
        { code: ACCOUNT.WALLET_AVAILABLE, userId: TEST_USER, amountKobo: 5_000_000n },
      ],
    });
    await postLedgerTransactionStandalone({
      reference: ref("rec2"),
      kind: "test",
      entries: [
        { code: ACCOUNT.WALLET_AVAILABLE, userId: TEST_USER, amountKobo: -2_000_000n },
        { code: ACCOUNT.WALLET_INVESTED, userId: TEST_USER, amountKobo: 2_000_000n },
      ],
    });

    const wallet = await prisma.wallet.findUniqueOrThrow({ where: { userId: TEST_USER } });
    const cached = wallet.availableBalance + wallet.investedBalance + wallet.earningsBalance;

    const accounts = await prisma.ledgerAccount.findMany({ where: { userId: TEST_USER } });
    const accountIds = accounts.map((a) => a.id);
    const entries = await prisma.ledgerEntry.findMany({ where: { accountId: { in: accountIds } } });
    const ledgerSum = entries.reduce((s, e) => s + e.amountKobo, 0n);

    expect(cached).toBe(ledgerSum);
  });
});
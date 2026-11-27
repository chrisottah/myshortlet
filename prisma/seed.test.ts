// prisma/seed.test.ts
import { describe, it, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import { getTotalReturnRate } from "../lib/config/investment";

const prisma = new PrismaClient();

describe("seed invariants", () => {
  it("every ledger transaction sums to zero", async () => {
    const txns = await prisma.ledgerTransaction.findMany({
      where: { NOT: { reference: { startsWith: "test." } } },
      include: { entries: { select: { amountKobo: true } } },
    });
    expect(txns.length).toBeGreaterThan(0); // fail loudly if the DB is unseeded
    for (const t of txns) {
      const sum = t.entries.reduce((s, e) => s + e.amountKobo, 0n);
      expect(sum, `ledger txn ${t.id} (${t.kind})`).toBe(0n);
    }
  });

  it("every wallet cached balance equals its ledger sum", async () => {
    const wallets = await prisma.wallet.findMany({
      where: { NOT: { userId: { startsWith: "test_" } } },
    });
    expect(wallets.length).toBeGreaterThan(0);

    for (const w of wallets) {
      // Sum of this user's ledger entries across all their wallet accounts.
      const accounts = await prisma.ledgerAccount.findMany({
        where: { userId: w.userId },
        select: { id: true },
      });
      const accountIds = accounts.map((a) => a.id);
      const entries = await prisma.ledgerEntry.findMany({
        where: { accountId: { in: accountIds } },
        select: { amountKobo: true },
      });
      const ledgerSum = entries.reduce((s, e) => s + e.amountKobo, 0n);
      const cached = w.availableBalance + w.investedBalance + w.earningsBalance;
      expect(cached, `wallet ${w.id} (user ${w.userId})`).toBe(ledgerSum);
    }
  });

  it("DB return schedule equals config", async () => {
    const rows = await prisma.returnScheduleEntry.findMany({
      orderBy: { effectiveFrom: "desc" },
    });
    expect(rows.length).toBeGreaterThan(0); // DB must be seeded
    const latest = new Map<number, number>();
    for (const r of rows) {
      if (!latest.has(r.termMonths)) latest.set(r.termMonths, Number(r.totalReturnRate));
    }
    for (const term of [1, 3, 6, 12]) {
      expect(latest.get(term), `term ${term}`).toBe(getTotalReturnRate(term));
    }
  });

  it("daily accruals over a term sum exactly to earnings", async () => {
    const inv = await prisma.investment.findUniqueOrThrow({ where: { id: "inv_001" } });
    const totalDays = inv.termDays;
    const perDay = inv.earningsKobo / BigInt(totalDays);
    const remainder = inv.earningsKobo - perDay * BigInt(totalDays);
    const reconstructed = perDay * BigInt(totalDays) + remainder;
    expect(reconstructed).toBe(inv.earningsKobo);
  });
});
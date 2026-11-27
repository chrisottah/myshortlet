// lib/services/investment-service.ts
// Prisma-backed. Keeps the same function names as the mock.
// Opportunity and Investment rows are the source of truth.

import { prisma } from "@/lib/db";
import { postLedgerTransaction } from "@/lib/ledger/post";
import { ACCOUNT } from "@/lib/ledger/accounts";
import { withIdempotency } from "@/lib/idempotency";
import { nairaToKobo, koboToNaira } from "@/lib/money";
import {
  getTotalReturnRate,
  calculateMaturityDate,
  deriveInvestmentStatus,
} from "@/lib/config/investment-engine";
import { INVESTMENT_CONFIG, getTierForMinInvestment } from "@/lib/config/investment";
import { writeAuditInTx } from "@/lib/audit/log";
import type {
  Investment as FeInvestment,
  InvestmentOpportunity as FeOpportunity,
  InvestmentStatus as FeInvestmentStatus,
} from "@/lib/types";
import type {
  Prisma,
  OpportunityStatus as DbOppStatus,
  InvestmentStatus as DbInvStatus,
  Tier,
} from "@prisma/client";

// ---------------------------------------------------------------------------
// Adapters: DB row → frontend shape.
// ---------------------------------------------------------------------------

type DbOpportunityRow = Prisma.OpportunityGetPayload<{
  include: { property: { include: { images: true } } };
}>;

type DbInvestmentRow = Prisma.InvestmentGetPayload<{
  include: { opportunity: true };
}>;

function oppToFrontend(row: DbOpportunityRow): FeOpportunity {
  // The frontend type still expects `termMonths` and `illustrativeReturnRate`.
  // We fill them from config until B7 removes them from the type.
  const headlineTerm = INVESTMENT_CONFIG.headlineTermMonths;
  const headlineTotal = getTotalReturnRate(headlineTerm);
  const illustrativeAnnual = headlineTotal * (12 / headlineTerm);

  return {
    id: row.id,
    propertyId: row.propertyId,
    title: row.title,
    summary: row.summary,
    minInvestment: koboToNaira(row.minInvestmentKobo),
    maxInvestment: row.maxInvestmentKobo ? koboToNaira(row.maxInvestmentKobo) : undefined,
    targetAmount: koboToNaira(row.targetAmountKobo),
    amountRaised: koboToNaira(row.amountRaisedKobo),
    termMonths: headlineTerm,
    illustrativeReturnRate: illustrativeAnnual,
    status: row.status as FeOpportunity["status"],
    badges: (row.badges as FeOpportunity["badges"]) ?? [],
    openDate: row.openDate.toISOString(),
    closeDate: row.closeDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function invToFrontend(row: DbInvestmentRow): FeInvestment {
  const totalRate = Number(row.totalReturnRate);
  const term = row.termMonths;
  return {
    id: row.id,
    investorId: row.investorId,
    opportunityId: row.opportunityId,
    amount: koboToNaira(row.principalKobo),
    illustrativeReturnRate: totalRate * (12 / term),
    termMonths: term,
    status: row.status as FeInvestmentStatus,
    investedAt: row.investedAt.toISOString(),
    maturityDate: row.maturityDate.toISOString(),
    earnings: koboToNaira(row.earningsKobo),
    maturityValue: koboToNaira(row.maturityValueKobo),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

function deriveTermDays(investedAt: Date, maturityDate: Date): number {
  return Math.max(1, Math.round((maturityDate.getTime() - investedAt.getTime()) / DAY_MS));
}

function tierForMinInvestmentKobo(kobo: bigint): Tier {
  const tier = getTierForMinInvestment(koboToNaira(kobo));
  return tier.id.toUpperCase() as Tier;
}

/** Recompute an opportunity's status from its dates + amountRaised. Called after any invest. */
async function advanceOpportunityStatus(
  tx: Prisma.TransactionClient,
  opportunityId: string
): Promise<void> {
  const opp = await tx.opportunity.findUniqueOrThrow({ where: { id: opportunityId } });
  const now = new Date();

  let status: DbOppStatus = opp.status as DbOppStatus;

  if (now < opp.openDate) {
    status = "upcoming";
  } else if (now > opp.closeDate) {
    status = "closed";
  } else if (opp.amountRaisedKobo >= opp.targetAmountKobo) {
    status = "funded";
  } else if (
    opp.amountRaisedKobo * 100n >=
    opp.targetAmountKobo * BigInt(Math.round(INVESTMENT_CONFIG.almostFundedThresholdPct ?? 95))
  ) {
    status = "almost_funded";
  } else {
    status = "open";
  }

  if (status !== opp.status) {
    await tx.opportunity.update({
      where: { id: opportunityId },
      data: { status },
    });
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const investmentService = {
  // ---- Opportunities ----

  async getOpportunities(filters?: {
    location?: string;
    status?: FeOpportunity["status"];
    minAmount?: number;
    maxAmount?: number;
  }): Promise<FeOpportunity[]> {
    const where: Prisma.OpportunityWhereInput = {};
    if (filters?.status) where.status = filters.status as DbOppStatus;
    if (filters?.minAmount !== undefined) {
      where.minInvestmentKobo = { gte: nairaToKobo(filters.minAmount) };
    }
    if (filters?.maxAmount !== undefined) {
      where.minInvestmentKobo = {
        ...(where.minInvestmentKobo as object | undefined),
        lte: nairaToKobo(filters.maxAmount),
      };
    }

    const rows = await prisma.opportunity.findMany({
      where,
      include: { property: { include: { images: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(oppToFrontend);
  },

  async getOpportunityById(id: string): Promise<FeOpportunity | undefined> {
    const row = await prisma.opportunity.findUnique({
      where: { id },
      include: { property: { include: { images: true } } },
    });
    return row ? oppToFrontend(row) : undefined;
  },

  async createOpportunity(input: {
    propertyId: string;
    title: string;
    summary: string;
    minInvestment: number;
    maxInvestment?: number;
    targetAmount: number;
    openDate: string;
    closeDate: string;
    tier?: Tier;
    badges?: FeOpportunity["badges"];
    slug?: string;
  }): Promise<FeOpportunity> {
    const minInvestmentKobo = nairaToKobo(input.minInvestment);
    const tier = input.tier ?? tierForMinInvestmentKobo(minInvestmentKobo);

    // Derive slug from title if not provided.
    const slug =
      input.slug ??
      input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
        "-" +
        Date.now().toString(36);

    const openDate = new Date(input.openDate);
    const now = new Date();
    const status: DbOppStatus =
      now < openDate ? "upcoming" : now > new Date(input.closeDate) ? "closed" : "open";

    const row = await prisma.opportunity.create({
      data: {
        propertyId: input.propertyId,
        slug,
        title: input.title,
        summary: input.summary,
        tier,
        minInvestmentKobo,
        maxInvestmentKobo: input.maxInvestment ? nairaToKobo(input.maxInvestment) : null,
        targetAmountKobo: nairaToKobo(input.targetAmount),
        amountRaisedKobo: 0n,
        status,
        badges: input.badges ?? [],
        openDate,
        closeDate: new Date(input.closeDate),
      },
      include: { property: { include: { images: true } } },
    });
    return oppToFrontend(row);
  },

  calculateInvestment(amount: number, termMonths: number, _opportunityId: string) {
    // Kept as a display helper. Does not depend on the opportunity
    // (returns are platform-wide per the doc). The 3rd arg is ignored.
    const rate = getTotalReturnRate(termMonths);
    const earnings = Math.round(amount * rate);
    const maturityValue = amount + earnings;
    return {
      amount,
      termMonths,
      totalReturnRate: rate,
      annualReturnRate: Number(((rate * 12) / termMonths).toFixed(4)),
      earnings,
      maturityValue,
      dailyAccrual: Math.floor(earnings / Math.max(1, termMonths * 30)),
    };
  },

  // ---- Investments ----

  async getInvestmentsByInvestor(investorId: string): Promise<FeInvestment[]> {
    const rows = await prisma.investment.findMany({
      where: { investorId },
      include: { opportunity: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(invToFrontend);
  },

  async getInvestmentById(id: string): Promise<FeInvestment | undefined> {
    const row = await prisma.investment.findUnique({
      where: { id },
      include: { opportunity: true },
    });
    return row ? invToFrontend(row) : undefined;
  },

  /**
   * @deprecated Pure display helper. Status is now stored and updated by jobs.
   * Kept so any lingering callers compile; returns the input unchanged.
   */
  withDerivedStatus(investment: FeInvestment): FeInvestment {
    const derived = deriveInvestmentStatus(
      investment.status,
      new Date(investment.maturityDate)
    );
    return derived === investment.status
      ? investment
      : { ...investment, status: derived };
  },

  /**
   * Create an investment. Atomic, idempotent, capacity-checked.
   *
   * 1. Within one DB transaction (via withIdempotency):
   *    - Lock + read opportunity and wallet
   *    - Validate status, dates, capacity, min/max
   *    - Snapshot the total return rate from the schedule
   *    - Insert Investment row
   *    - Post ledger: wallet.available → wallet.invested
   *    - Update opportunity.amountRaisedKobo + status
   *    - Write audit
   */
  async createInvestment(input: {
    investorId: string;
    opportunityId: string;
    amount: number; // naira
    termMonths: number;
    idempotencyKey?: string;
  }): Promise<FeInvestment> {
    const amountKobo = nairaToKobo(input.amount);

    // Validate term against the current schedule.
    const totalRate = getTotalReturnRate(input.termMonths); // throws if unsupported

    const idempotencyKey =
      input.idempotencyKey ??
      `investment.create:${input.investorId}:${input.opportunityId}:${Date.now()}`;

    const result = await withIdempotency(
      { scope: "investment.create", key: idempotencyKey, userId: input.investorId },
      async (tx) => {
        // Lock opportunity row so concurrent invests serialize on it.
        await tx.$queryRaw`SELECT id FROM "Opportunity" WHERE id = ${input.opportunityId} FOR UPDATE`;

        const opp = await tx.opportunity.findUniqueOrThrow({
          where: { id: input.opportunityId },
        });
        const wallet = await tx.wallet.findUniqueOrThrow({
          where: { userId: input.investorId },
        });

        // Validate status.
        if (opp.status !== "open" && opp.status !== "almost_funded") {
          throw new Error(`Opportunity is not open for investment (status: ${opp.status})`);
        }
        // Validate dates.
        const now = new Date();
        if (now < opp.openDate) throw new Error("Opportunity has not opened yet");
        if (now > opp.closeDate) throw new Error("Opportunity has closed");

        // Validate amounts.
        if (amountKobo < opp.minInvestmentKobo) {
          throw new Error(
            `Amount below minimum (min ₦${koboToNaira(opp.minInvestmentKobo).toLocaleString()})`
          );
        }
        if (opp.maxInvestmentKobo && amountKobo > opp.maxInvestmentKobo) {
          throw new Error(
            `Amount above maximum (max ₦${koboToNaira(opp.maxInvestmentKobo).toLocaleString()})`
          );
        }
        // Validate capacity.
        if (opp.amountRaisedKobo + amountKobo > opp.targetAmountKobo) {
          throw new Error("This investment would exceed the funding target");
        }
        // Validate balance.
        if (wallet.availableBalance < amountKobo) {
          throw new Error("Insufficient available balance");
        }

        // Compute earnings from the snapshot rate.
        const earningsKobo = BigInt(Math.round(Number(amountKobo) * totalRate));
        const maturityValueKobo = amountKobo + earningsKobo;

        // Decide maturity date.
        const investedAt = now;
        const maturityDate = calculateMaturityDate(investedAt, input.termMonths);
        const termDays = deriveTermDays(investedAt, maturityDate);

        // Insert the Investment.
        const created = await tx.investment.create({
          data: {
            investorId: input.investorId,
            opportunityId: input.opportunityId,
            principalKobo: amountKobo,
            termMonths: input.termMonths,
            totalReturnRate: totalRate.toString(),
            termDays,
            investedAt,
            maturityDate,
            earningsKobo,
            maturityValueKobo,
            status: "active",
          },
        });

        // Post the ledger move: available → invested.
        await postLedgerTransaction(tx, {
          reference: `investment.create:${created.id}`,
          kind: "investment.credit",
          description: `Investment in ${opp.title}`,
          meta: { investmentId: created.id },
          entries: [
            { code: ACCOUNT.WALLET_AVAILABLE, userId: input.investorId, amountKobo: -amountKobo },
            { code: ACCOUNT.WALLET_INVESTED, userId: input.investorId, amountKobo },
          ],
        });

        // Update opportunity amountRaisedKobo.
        await tx.opportunity.update({
          where: { id: opp.id },
          data: { amountRaisedKobo: { increment: amountKobo } },
        });

        // Auto-advance opportunity status.
        await advanceOpportunityStatus(tx, opp.id);

        // Audit.
        await writeAuditInTx(tx, {
          actorId: input.investorId,
          actorRole: "investor",
          action: "investment.created",
          targetType: "Investment",
          targetId: created.id,
          after: {
            principalKobo: amountKobo.toString(),
            termMonths: input.termMonths,
            totalReturnRate: totalRate.toString(),
          },
        });

        return created.id;
      }
    );

    const row = await prisma.investment.findUniqueOrThrow({
      where: { id: result },
      include: { opportunity: true },
    });
    return invToFrontend(row);
  },

  /**
   * @deprecated No-op. Investments are `active` from creation now.
   * Kept so callers compile.
   */
  activateInvestment(_investmentId: string): Promise<void> {
    return Promise.resolve();
  },

  /**
   * Mark an investment matured → withdrawn. Creates the payout ledger entries.
   * Use for early exits (B3.3) and admin actions; normal maturity is handled
   * by the job in B3.2.
   */
  async markWithdrawn(investmentId: string): Promise<FeInvestment> {
    const investment = await prisma.investment.findUniqueOrThrow({
      where: { id: investmentId },
    });
    if (investment.status === "withdrawn") {
      return invToFrontend(
        await prisma.investment.findUniqueOrThrow({
          where: { id: investmentId },
          include: { opportunity: true },
        })
      );
    }
    if (investment.status !== "matured") {
      throw new Error(`Cannot withdraw investment in status ${investment.status}`);
    }

    await withIdempotency(
      { scope: "investment.withdraw", key: investmentId },
      async (tx) => {
        await postLedgerTransaction(tx, {
          reference: `investment.withdraw:${investment.id}`,
          kind: "maturity.payout",
          description: "Maturity payout",
          meta: { investmentId: investment.id },
          entries: [
            { code: ACCOUNT.WALLET_INVESTED, userId: investment.investorId, amountKobo: -investment.principalKobo },
            { code: ACCOUNT.WALLET_AVAILABLE, userId: investment.investorId, amountKobo: investment.maturityValueKobo },
            { code: ACCOUNT.ACCRUED_LIABILITY, amountKobo: -investment.earningsKobo },
          ],
        });
        await tx.investment.update({
          where: { id: investment.id },
          data: { status: "withdrawn" },
        });
      }
    );

    const updated = await prisma.investment.findUniqueOrThrow({
      where: { id: investmentId },
      include: { opportunity: true },
    });
    return invToFrontend(updated);
  },

  /**
   * Reinvest a matured investment into a new opportunity/term.
   * Not enabled at B3.1 (needs the maturity flow from B3.2 first), kept as a stub.
   */
  async reinvest(_investmentId: string, _newOpportunityId: string, _newTermMonths: number): Promise<FeInvestment> {
    throw new Error("Reinvest is coming in a later release.");
  },

  /** @deprecated No-op. Seed lives in prisma/seed.ts. */
  seedOpportunities(_items: FeOpportunity[]): void {
    // intentionally empty
  },

  /** @deprecated No-op. Seed lives in prisma/seed.ts. */
  seedInvestments(_items: FeInvestment[]): void {
    // intentionally empty
  },
};
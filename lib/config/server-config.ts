// lib/config/server-config.ts
// Server-only config reader. Reads from Postgres; falls back to investment.ts.
//
// NOTE: no `import "server-only"` — this module is imported from server
// components/actions, which Next.js already isolates. The guard was
// breaking standalone tsx execution (seed script, tests).

import { prisma } from "@/lib/db";
import {
  INVESTMENT_CONFIG,
  getTotalReturnRate,
  type InvestmentTier,
  type TierId,
} from "./investment";

export interface LiveInvestmentConfig {
  /** termMonths → totalReturnRate (decimal, e.g. 1.71 for 12 months = 171%) */
  returnSchedule: Map<number, number>;
  availableTerms: number[];
  headlineTermMonths: number;
  tiers: InvestmentTier[];
  /** Amount in kobo. */
  getTierById: (id: TierId) => InvestmentTier | undefined;
}

let cache: { config: LiveInvestmentConfig; expiresAt: number } | null = null;
const CACHE_MS = 30_000;

export async function getInvestmentConfig(): Promise<LiveInvestmentConfig> {
  if (cache && cache.expiresAt > Date.now()) return cache.config;

  const [scheduleRows, classRows] = await Promise.all([
    prisma.returnScheduleEntry.findMany({
      where: { effectiveFrom: { lte: new Date() } },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.propertyClass.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  let config: LiveInvestmentConfig;

  if (scheduleRows.length === 0 || classRows.length === 0) {
    config = fallbackConfig();
  } else {
    // latest effective row per term wins
    const latestByTerm = new Map<number, number>();
    for (const row of scheduleRows) {
      if (!latestByTerm.has(row.termMonths)) {
        latestByTerm.set(row.termMonths, Number(row.totalReturnRate));
      }
    }
    const tiers: InvestmentTier[] = classRows.map((c) => ({
      id: c.tier as TierId,
      name: c.name,
      tagline: c.tagline ?? "",
      minInvestment: Number(c.minInvestmentKobo) / 100,
      presetAmounts: (c.presetAmountsKobo ?? []).map((k) => Number(k) / 100),
    }));
    config = {
      returnSchedule: latestByTerm,
      availableTerms: [...latestByTerm.keys()].sort((a, b) => a - b),
      headlineTermMonths: INVESTMENT_CONFIG.headlineTermMonths,
      tiers,
      getTierById: (id) => tiers.find((t) => t.id === id),
    };
  }

  cache = { config, expiresAt: Date.now() + CACHE_MS };
  return config;
}

function fallbackConfig(): LiveInvestmentConfig {
  const schedule = new Map<number, number>();
  for (const term of INVESTMENT_CONFIG.availableTerms) {
    schedule.set(term, getTotalReturnRate(term));
  }
  return {
    returnSchedule: schedule,
    availableTerms: INVESTMENT_CONFIG.availableTerms,
    headlineTermMonths: INVESTMENT_CONFIG.headlineTermMonths,
    tiers: INVESTMENT_CONFIG.tiers,
    getTierById: (id) => INVESTMENT_CONFIG.tiers.find((t) => t.id === id),
  };
}

/** Force a re-read on next call. Call this after admin config changes. */
export function invalidateInvestmentConfigCache(): void {
  cache = null;
}
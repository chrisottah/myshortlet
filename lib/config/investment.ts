// lib/config/investment.ts
// Single source of truth for return figures, terms, tiers and image limits.
// Edit the figures between the markers; every page, the calculator and the
// engine read from here.

export type TierId = "starter" | "standard" | "select" | "premier";

export interface InvestmentTier {
  id: TierId;
  name: string;
  tagline: string;
  minInvestment: number;
  presetAmounts: number[];
}

// ---------- EDIT THESE FIGURES ----------

/**
 * Total return (decimal) for each term.
 * Longer terms must earn a HIGHER effective monthly rate than shorter ones —
 * enforced by a Vitest test in lib/config/investment.test.ts.
 * 1 mo = 12.55%/mo (anchor), 3 mo = 13.10%/mo, 6 mo = 13.65%/mo, 12 mo = 14.25%/mo.
 */
const RETURN_SCHEDULE_BY_TERM: Record<number, number> = {
  1: 0.1255,  // 12.55% total — 12.55% /mo
  3: 0.3930,  // 39.30% total — 13.10% /mo
  6: 0.8190,  // 81.90% total — 13.65% /mo
  12: 1.7100, // 171.00% total — 14.25% /mo
};

/** Term used for the headline figure on cards and the homepage. */
const HEADLINE_TERM_MONTHS = 12;

/** Placeholder tier names and bands: replace with the business team's. */
const TIERS: InvestmentTier[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Entry-level properties",
    minInvestment: 100_000,
    presetAmounts: [100_000, 200_000, 300_000, 400_000],
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "Well-located city properties",
    minInvestment: 500_000,
    presetAmounts: [500_000, 600_000, 750_000, 900_000],
  },
  {
    id: "select",
    name: "Select",
    tagline: "Premium city apartments",
    minInvestment: 1_000_000,
    presetAmounts: [1_000_000, 1_250_000, 1_500_000, 2_000_000],
  },
  {
    id: "premier",
    name: "Premier",
    tagline: "Our most exclusive properties",
    minInvestment: 2_500_000,
    presetAmounts: [2_500_000, 5_000_000, 7_500_000, 10_000_000],
  },
];

// ----------------------------------------

const TERMS = Object.keys(RETURN_SCHEDULE_BY_TERM)
  .map(Number)
  .sort((a, b) => a - b);

export const INVESTMENT_CONFIG = {
  currency: "NGN",
  returnScheduleByTerm: RETURN_SCHEDULE_BY_TERM,
  availableTerms: TERMS,
  headlineTermMonths: HEADLINE_TERM_MONTHS,
  tiers: TIERS,
  maxImagesPerProperty: 10,
  approachingMaturityWindowDays: 14,
    almostFundedThresholdPct: 95,

  // Derived values, kept so older imports keep working.
  minInvestmentDefault: TIERS[0].minInvestment,
  presetAmounts: TIERS.flatMap((t) => t.presetAmounts),
  defaultIllustrativeReturnRate: Number(
    ((RETURN_SCHEDULE_BY_TERM[HEADLINE_TERM_MONTHS] * 12) / HEADLINE_TERM_MONTHS).toFixed(4)
  ),
};

/** Total return (decimal) for a term. Throws if the term is not in the schedule. */
export function getTotalReturnRate(termMonths: number): number {
  const rate = RETURN_SCHEDULE_BY_TERM[termMonths];
  if (rate === undefined) {
    throw new Error(`No return rate configured for a ${termMonths}-month term`);
  }
  return rate;
}

/**
 * Effective return per month for a term: totalReturnRate / termMonths.
 * Enforces that longer terms are more profitable per month, not just in total.
 */
export function getEffectiveMonthlyRate(termMonths: number): number {
  return getTotalReturnRate(termMonths) / termMonths;
}

/** @deprecated The return no longer depends on a per-opportunity base rate. */

/**
 * Highest tier whose minimum is at or below the given minimum investment.
 * Used by the frontend to label a card/opportunity with its class.
 * In the backend, `tier` is stored explicitly on the opportunity; this helper
 * is display-only.
 */
export function getTierForMinInvestment(minInvestment: number): InvestmentTier {
  const sorted = [...TIERS].sort((a, b) => b.minInvestment - a.minInvestment);
  return sorted.find((t) => minInvestment >= t.minInvestment) ?? TIERS[0];
}

export function getIllustrativeRateForTerm(_baseRate: number, termMonths: number): number {
  const total = getTotalReturnRate(termMonths);
  return Number(((total * 12) / termMonths).toFixed(4));
}
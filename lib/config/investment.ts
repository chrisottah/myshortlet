// lib/config/investment.ts

export const INVESTMENT_CONFIG = {
  currency: "NGN",
  minInvestmentDefault: 100_000,
  availableTerms: [3, 6, 12, 18, 24] as const, // months
  defaultIllustrativeReturnRate: 0.18, // 18% annualized, illustrative
  termRateModifiers: {
    3: -0.04,
    6: -0.02,
    12: 0,
    18: 0.015,
    24: 0.03,
  } as Record<number, number>,
  approachingMaturityWindowDays: 14,
  presetAmounts: [100_000, 250_000, 500_000, 1_000_000, 2_500_000],
} as const;

export function getIllustrativeRateForTerm(
  baseRate: number,
  termMonths: number
): number {
  const modifier = INVESTMENT_CONFIG.termRateModifiers[termMonths] ?? 0;
  return Number((baseRate + modifier).toFixed(4));
}
// lib/config/investment-engine.ts

import { InvestmentStatus } from "@/lib/types";
import { INVESTMENT_CONFIG } from "./investment";

const DAY_MS = 1000 * 60 * 60 * 24;

interface EarningsInput {
  amount: number;
  termMonths: number;
  /** @deprecated Ignored. Returns now come from the schedule in investment.ts. */
  annualReturnRate?: number;
}

/** Total return (decimal) for a term, from the config schedule. */
export function getTotalReturnRate(termMonths: number): number {
  const rate = INVESTMENT_CONFIG.returnScheduleByTerm[termMonths];
  if (rate === undefined) {
    throw new Error(`No return rate configured for a ${termMonths}-month term`);
  }
  return rate;
}

/** Annualised equivalent of a term's total return (kept for older code). */
export function getAnnualEquivalentRate(termMonths: number): number {
  return Number(((getTotalReturnRate(termMonths) * 12) / termMonths).toFixed(4));
}

export function getHeadlineReturn() {
  const termMonths = INVESTMENT_CONFIG.headlineTermMonths;
  return { termMonths, totalReturnRate: getTotalReturnRate(termMonths) };
}

export function getTermRange() {
  const terms = INVESTMENT_CONFIG.availableTerms;
  return { min: terms[0], max: terms[terms.length - 1] };
}

export function calculateEarnings({ amount, termMonths }: EarningsInput): number {
  return Math.round(amount * getTotalReturnRate(termMonths));
}

export function calculateMaturityValue(input: EarningsInput): number {
  return input.amount + calculateEarnings(input);
}

export function calculateMaturityDate(investedAt: Date, termMonths: number): Date {
  const date = new Date(investedAt);
  date.setMonth(date.getMonth() + termMonths);
  return date;
}

/**
 * Return accrued so far, in whole naira. Grows evenly day by day, is exactly
 * `earnings` on the maturity day, and is shown as locked until then.
 */
export function calculateAccruedEarnings(params: {
  earnings: number;
  investedAt: Date;
  maturityDate: Date;
  now?: Date;
}): number {
  const { earnings, investedAt, maturityDate, now = new Date() } = params;
  const totalMs = maturityDate.getTime() - investedAt.getTime();
  if (totalMs <= 0) return earnings;
  const totalDays = Math.max(1, Math.round(totalMs / DAY_MS));
  const elapsedDays = Math.min(
    totalDays,
    Math.max(0, Math.floor((now.getTime() - investedAt.getTime()) / DAY_MS))
  );
  return Math.floor((earnings * elapsedDays) / totalDays);
}

/**
 * Derives the current status of an investment based on dates.
 * "pending" / "withdrawn" / "reinvested" / "cancelled" are set explicitly
 * by service actions, not derived. This only resolves the natural
 * active -> approaching_maturity -> matured progression.
 */
export function deriveInvestmentStatus(
  currentStatus: InvestmentStatus,
  maturityDate: Date,
  now: Date = new Date()
): InvestmentStatus {
  if (
    currentStatus === "withdrawn" ||
    currentStatus === "reinvested" ||
    currentStatus === "cancelled" ||
    currentStatus === "pending"
  ) {
    return currentStatus;
  }

  const msRemaining = maturityDate.getTime() - now.getTime();
  const daysRemaining = msRemaining / DAY_MS;

  if (daysRemaining <= 0) return "matured";
  if (daysRemaining <= INVESTMENT_CONFIG.approachingMaturityWindowDays) {
    return "approaching_maturity";
  }
  return "active";
}

export function buildInvestmentCalculation(
  amount: number,
  termMonths: number,
  _legacyBaseAnnualRate?: number // ignored; kept so existing callers compile
) {
  const totalReturnRate = getTotalReturnRate(termMonths);
  const earnings = calculateEarnings({ amount, termMonths });
  const maturityDate = calculateMaturityDate(new Date(), termMonths);
  const termDays = Math.max(1, Math.round((maturityDate.getTime() - Date.now()) / DAY_MS));

  return {
    amount,
    termMonths,
    totalReturnRate,
    annualReturnRate: getAnnualEquivalentRate(termMonths),
    earnings,
    maturityValue: amount + earnings,
    termDays,
    dailyAccrual: Math.floor(earnings / termDays),
  };
}
// lib/config/investment-engine.ts

import { InvestmentStatus } from "@/lib/types";
import { INVESTMENT_CONFIG } from "./investment";

interface EarningsInput {
  amount: number;
  annualReturnRate: number; // e.g. 0.18
  termMonths: number;
}

export function calculateEarnings({
  amount,
  annualReturnRate,
  termMonths,
}: EarningsInput): number {
  const fraction = termMonths / 12;
  const earnings = amount * annualReturnRate * fraction;
  return Math.round(earnings);
}

export function calculateMaturityValue(input: EarningsInput): number {
  return input.amount + calculateEarnings(input);
}

export function calculateMaturityDate(
  investedAt: Date,
  termMonths: number
): Date {
  const date = new Date(investedAt);
  date.setMonth(date.getMonth() + termMonths);
  return date;
}

/**
 * Derives the current status of an investment based on dates.
 * "pending" / "withdrawn" / "reinvested" / "cancelled" are set explicitly
 * by service actions, not derived — this only resolves the natural
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
  const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);

  if (daysRemaining <= 0) return "matured";
  if (daysRemaining <= INVESTMENT_CONFIG.approachingMaturityWindowDays) {
    return "approaching_maturity";
  }
  return "active";
}

export function buildInvestmentCalculation(
  amount: number,
  termMonths: number,
  baseAnnualRate: number
) {
  const modifier = INVESTMENT_CONFIG.termRateModifiers[termMonths] ?? 0;
  const annualReturnRate = Number((baseAnnualRate + modifier).toFixed(4));
  const earnings = calculateEarnings({ amount, annualReturnRate, termMonths });
  const maturityValue = amount + earnings;

  return {
    amount,
    termMonths,
    annualReturnRate,
    earnings,
    maturityValue,
  };
}
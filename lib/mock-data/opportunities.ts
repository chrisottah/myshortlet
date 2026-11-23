// lib/mock-data/opportunities.ts

import { InvestmentOpportunity } from "@/lib/types";
import { INVESTMENT_CONFIG } from "@/lib/config/investment";

const now = new Date();
const nowIso = now.toISOString();
const RATE = INVESTMENT_CONFIG.defaultIllustrativeReturnRate;

function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const opportunities: InvestmentOpportunity[] = [
  {
    id: "opp_01",
    propertyId: "prop_01",
    title: "The Manuela — Waterfront Apartment Opportunity",
    summary:
      "Fund a share of this high-demand Lekki Phase 1 waterfront apartment and earn illustrative returns over your chosen term.",
    minInvestment: 2_500_000,
    targetAmount: 40_000_000,
    amountRaised: 27_400_000,
    termMonths: 12,
    illustrativeReturnRate: RATE,
    status: "open",
    badges: ["featured", "popular"],
    openDate: daysFromNow(-20),
    closeDate: daysFromNow(25),
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "opp_02",
    propertyId: "prop_02",
    title: "Ivory Court — Ikoyi Residence Opportunity",
    summary:
      "An elegant Ikoyi residence favored by executive travelers, with illustrative returns over your chosen term.",
    minInvestment: 1_000_000,
    targetAmount: 25_000_000,
    amountRaised: 23_800_000,
    termMonths: 6,
    illustrativeReturnRate: RATE,
    status: "almost_funded",
    badges: ["almost_funded"],
    openDate: daysFromNow(-35),
    closeDate: daysFromNow(5),
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "opp_03",
    propertyId: "prop_03",
    title: "Skyline Loft — VI Penthouse Opportunity",
    summary:
      "A premium Victoria Island penthouse investment with panoramic views and illustrative returns over your chosen term.",
    minInvestment: 2_500_000,
    targetAmount: 70_000_000,
    amountRaised: 18_500_000,
    termMonths: 12,
    illustrativeReturnRate: RATE,
    status: "open",
    badges: ["featured"],
    openDate: daysFromNow(-10),
    closeDate: daysFromNow(50),
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "opp_04",
    propertyId: "prop_04",
    title: "Garden Villa — Ikeja GRA Opportunity",
    summary:
      "A family-friendly villa investment in leafy Ikeja GRA with steady occupancy from extended-stay guests.",
    minInvestment: 100_000,
    targetAmount: 30_000_000,
    amountRaised: 9_200_000,
    termMonths: 12,
    illustrativeReturnRate: RATE,
    status: "open",
    badges: ["new"],
    openDate: daysFromNow(-3),
    closeDate: daysFromNow(40),
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "opp_05",
    propertyId: "prop_05",
    title: "Coral Studio — Ajah Opportunity",
    summary:
      "A lower entry-point opportunity in the fast-growing Ajah corridor, ideal for first-time investors.",
    minInvestment: 100_000,
    targetAmount: 10_000_000,
    amountRaised: 6_700_000,
    termMonths: 3,
    illustrativeReturnRate: RATE,
    status: "open",
    badges: ["new", "popular"],
    openDate: daysFromNow(-8),
    closeDate: daysFromNow(15),
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: "opp_06",
    propertyId: "prop_08",
    title: "Lakeside Duplex — Ikeja Opportunity",
    summary:
      "A serene duplex near the Ikeja golf course with strong repeat corporate bookings.",
    minInvestment: 1_000_000,
    targetAmount: 28_000_000,
    amountRaised: 28_000_000,
    termMonths: 6,
    illustrativeReturnRate: RATE,
    status: "funded",
    badges: [],
    openDate: daysFromNow(-60),
    closeDate: daysFromNow(-2),
    createdAt: nowIso,
    updatedAt: nowIso,
  },
];
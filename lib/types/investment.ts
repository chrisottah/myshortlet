// lib/types/investment.ts

export type OpportunityStatus =
  | "upcoming"
  | "open"
  | "almost_funded"
  | "funded"
  | "closed";

export type OpportunityBadge = "featured" | "new" | "almost_funded" | "popular";

export interface InvestmentOpportunity {
  id: string;
  propertyId: string;
  title: string;
  summary: string;
  minInvestment: number;
  maxInvestment?: number;
  targetAmount: number;
  amountRaised: number;
  termMonths: number;
  illustrativeReturnRate: number; // annualized, e.g. 0.18 for 18%
  status: OpportunityStatus;
  badges: OpportunityBadge[];
  openDate: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
}

export type InvestmentStatus =
  | "pending"
  | "active"
  | "approaching_maturity"
  | "matured"
  | "withdrawn"
  | "reinvested"
  | "cancelled";

export interface Investment {
  id: string;
  investorId: string;
  opportunityId: string;
  amount: number;
  illustrativeReturnRate: number; // snapshot at time of investment
  termMonths: number;
  status: InvestmentStatus;
  investedAt: string;
  maturityDate: string;
  earnings: number; // computed via investment engine
  maturityValue: number; // amount + earnings
  createdAt: string;
  updatedAt: string;
}
// lib/services/investment-service.ts

import { MockRepository, generateId } from "./mock-db";
import {
  Investment,
  InvestmentOpportunity,
  InvestmentStatus,
} from "@/lib/types";
import {
  buildInvestmentCalculation,
  calculateMaturityDate,
  deriveInvestmentStatus,
} from "@/lib/config/investment-engine";
import { INVESTMENT_CONFIG } from "@/lib/config/investment";
import { walletService } from "./wallet-service";
import { transactionService } from "./transaction-service";
import { notificationService } from "./notification-service";

// Repositories are populated by seed data in Phase 3 via `seedInvestments`/`seedOpportunities`.
const opportunityRepo = new MockRepository<InvestmentOpportunity>();
const investmentRepo = new MockRepository<Investment>();

export const investmentService = {
  // ---- Opportunities ----
  getOpportunities(filters?: {
    location?: string;
    status?: InvestmentOpportunity["status"];
    minAmount?: number;
    maxAmount?: number;
  }) {
    let results = opportunityRepo.findAll();
    if (filters?.status) {
      results = results.filter((o) => o.status === filters.status);
    }
    if (filters?.minAmount !== undefined) {
      results = results.filter((o) => o.minInvestment >= filters.minAmount!);
    }
    if (filters?.maxAmount !== undefined) {
      results = results.filter((o) => o.minInvestment <= filters.maxAmount!);
    }
    return results;
  },

  getOpportunityById(id: string) {
    return opportunityRepo.findById(id);
  },

  seedOpportunities(items: InvestmentOpportunity[]) {
    items.forEach((item) => opportunityRepo.create(item));
  },

  createOpportunity(input: {
  propertyId: string;
  title: string;
  summary: string;
  minInvestment: number;
  maxInvestment?: number;
  targetAmount: number;
  termMonths: number;
  illustrativeReturnRate: number;
  openDate: string;
  closeDate: string;
  badges?: InvestmentOpportunity["badges"];
}): InvestmentOpportunity {
  const now = new Date().toISOString();
  const isOpenAlready = new Date(input.openDate) <= new Date(now);

  const opportunity: InvestmentOpportunity = {
    id: generateId("opp"),
    propertyId: input.propertyId,
    title: input.title,
    summary: input.summary,
    minInvestment: input.minInvestment,
    maxInvestment: input.maxInvestment,
    targetAmount: input.targetAmount,
    amountRaised: 0,
    termMonths: input.termMonths,
    illustrativeReturnRate: input.illustrativeReturnRate,
    status: isOpenAlready ? "open" : "upcoming",
    badges: input.badges ?? [],
    openDate: input.openDate,
    closeDate: input.closeDate,
    createdAt: now,
    updatedAt: now,
  };

  return opportunityRepo.create(opportunity);
},

  calculateInvestment(amount: number, termMonths: number, opportunityId: string) {
    const opportunity = opportunityRepo.findById(opportunityId);
    if (!opportunity) throw new Error("Opportunity not found");
    return buildInvestmentCalculation(
      amount,
      termMonths,
      opportunity.illustrativeReturnRate
    );
  },

  // ---- Investments ----
  getInvestmentsByInvestor(investorId: string) {
    return investmentRepo
      .findWhere((inv) => inv.investorId === investorId)
      .map((inv) => this.withDerivedStatus(inv));
  },

  getInvestmentById(id: string) {
    const inv = investmentRepo.findById(id);
    return inv ? this.withDerivedStatus(inv) : undefined;
  },

  withDerivedStatus(investment: Investment): Investment {
    const status = deriveInvestmentStatus(
      investment.status,
      new Date(investment.maturityDate)
    );
    return status === investment.status
      ? investment
      : investmentRepo.update(investment.id, { status }) ?? investment;
  },

  seedInvestments(items: Investment[]) {
    items.forEach((item) => investmentRepo.create(item));
  },

  /**
   * Creates a new investment: debits wallet available balance,
   * credits invested balance, writes a transaction, updates the
   * opportunity's raised amount, and notifies the investor.
   */
  createInvestment(input: {
    investorId: string;
    opportunityId: string;
    amount: number;
    termMonths: number;
  }): Investment {
    const opportunity = opportunityRepo.findById(input.opportunityId);
    if (!opportunity) throw new Error("Opportunity not found");
    if (input.amount < opportunity.minInvestment) {
      throw new Error("Amount below minimum investment");
    }

    const wallet = walletService.getWalletByUserId(input.investorId);
    if (!wallet || wallet.availableBalance < input.amount) {
      throw new Error("Insufficient available balance");
    }

    const calc = buildInvestmentCalculation(
      input.amount,
      input.termMonths,
      opportunity.illustrativeReturnRate
    );
    const investedAt = new Date();
    const maturityDate = calculateMaturityDate(investedAt, input.termMonths);

    const investment: Investment = {
      id: generateId("inv"),
      investorId: input.investorId,
      opportunityId: input.opportunityId,
      amount: input.amount,
      illustrativeReturnRate: calc.annualReturnRate,
      termMonths: input.termMonths,
      status: "pending" as InvestmentStatus,
      investedAt: investedAt.toISOString(),
      maturityDate: maturityDate.toISOString(),
      earnings: calc.earnings,
      maturityValue: calc.maturityValue,
      createdAt: investedAt.toISOString(),
      updatedAt: investedAt.toISOString(),
    };

    investmentRepo.create(investment);

    walletService.debitAvailable(input.investorId, input.amount);
    walletService.creditInvested(input.investorId, input.amount);

    opportunityRepo.update(opportunity.id, {
      amountRaised: opportunity.amountRaised + input.amount,
    });

    transactionService.record({
      userId: input.investorId,
      type: "investment",
      amount: input.amount,
      status: "completed",
      relatedInvestmentId: investment.id,
      description: `Investment in ${opportunity.title}`,
    });

    notificationService.notify({
      userId: input.investorId,
      type: "investment_update",
      title: "Investment confirmed",
      message: `Your investment of ₦${input.amount.toLocaleString()} in ${opportunity.title} is now pending activation.`,
    });

    return investment;
  },

  activateInvestment(investmentId: string) {
    return investmentRepo.update(investmentId, { status: "active" });
  },

  markWithdrawn(investmentId: string) {
    const inv = investmentRepo.findById(investmentId);
    if (!inv) throw new Error("Investment not found");
    walletService.debitEarningsAndInvested(inv.investorId, inv.amount, inv.earnings);
    return investmentRepo.update(investmentId, { status: "withdrawn" });
  },

  reinvest(investmentId: string, newOpportunityId: string, newTermMonths: number) {
    const matured = investmentRepo.findById(investmentId);
    if (!matured) throw new Error("Investment not found");
    if (matured.status !== "matured") throw new Error("Investment not matured");

    investmentRepo.update(investmentId, { status: "reinvested" });

    return this.createInvestment({
      investorId: matured.investorId,
      opportunityId: newOpportunityId,
      amount: matured.maturityValue,
      termMonths: newTermMonths,
    });
  },
};
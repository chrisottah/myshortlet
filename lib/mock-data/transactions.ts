// lib/mock-data/transactions.ts

import { Transaction } from "@/lib/types";

const now = new Date();
function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
function ref(): string {
  return `REF${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const transactions: Transaction[] = [
  { id: "txn_001", userId: "user_inv_01", type: "investment", amount: 1_000_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_001", description: "Investment in The Manuela — Waterfront Apartment Opportunity", createdAt: daysFromNow(-60) },
  { id: "txn_002", userId: "user_inv_01", type: "investment", amount: 1_500_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_002", description: "Investment in Skyline Loft — VI Penthouse Opportunity", createdAt: daysFromNow(-40) },
  { id: "txn_003", userId: "user_inv_02", type: "investment", amount: 2_000_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_003", description: "Investment in The Manuela — Waterfront Apartment Opportunity", createdAt: daysFromNow(-90) },
  { id: "txn_004", userId: "user_inv_02", type: "investment", amount: 2_000_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_004", description: "Investment in Ivory Court — Ikoyi Residence Opportunity", createdAt: daysFromNow(-200) },
  { id: "txn_005", userId: "user_inv_02", type: "earning", amount: 160_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_004", description: "Earnings credited on matured investment", createdAt: daysFromNow(-15) },
  { id: "txn_006", userId: "user_inv_03", type: "investment", amount: 500_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_005", description: "Investment in Coral Studio — Ajah Opportunity", createdAt: daysFromNow(-100) },
  { id: "txn_007", userId: "user_inv_03", type: "earning", amount: 17_500, status: "completed", reference: ref(), relatedInvestmentId: "inv_005", description: "Earnings credited on matured investment", createdAt: daysFromNow(-10) },
  { id: "txn_008", userId: "user_inv_03", type: "investment", amount: 500_000, status: "pending", reference: ref(), relatedInvestmentId: "inv_006", description: "Investment in Garden Villa — Ikeja GRA Opportunity", createdAt: daysFromNow(-1) },
  { id: "txn_009", userId: "user_inv_04", type: "investment", amount: 500_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_007", description: "Investment in Coral Studio — Ajah Opportunity", createdAt: daysFromNow(-20) },
  { id: "txn_010", userId: "user_inv_05", type: "investment", amount: 3_000_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_008", description: "Investment in Skyline Loft — VI Penthouse Opportunity", createdAt: daysFromNow(-50) },
  { id: "txn_011", userId: "user_inv_05", type: "investment", amount: 2_000_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_009", description: "Investment in The Manuela — Waterfront Apartment Opportunity", createdAt: daysFromNow(-355) },
  { id: "txn_012", userId: "user_inv_05", type: "investment", amount: 1_500_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_010", description: "Investment in Lakeside Duplex — Ikeja Opportunity", createdAt: daysFromNow(-560) },
  { id: "txn_013", userId: "user_inv_05", type: "earning", amount: 438_750, status: "completed", reference: ref(), relatedInvestmentId: "inv_010", description: "Earnings credited on matured investment", createdAt: daysFromNow(-20) },
  { id: "txn_014", userId: "user_inv_06", type: "investment", amount: 1_000_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_011", description: "Investment in Garden Villa — Ikeja GRA Opportunity", createdAt: daysFromNow(-30) },
  { id: "txn_015", userId: "user_inv_06", type: "investment", amount: 500_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_012", description: "Investment in Ivory Court — Ikoyi Residence Opportunity", createdAt: daysFromNow(-15) },
  { id: "txn_016", userId: "user_inv_07", type: "investment", amount: 750_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_013", description: "Investment in Coral Studio — Ajah Opportunity", createdAt: daysFromNow(-110) },
  { id: "txn_017", userId: "user_inv_08", type: "investment", amount: 2_000_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_014", description: "Investment in Skyline Loft — VI Penthouse Opportunity", createdAt: daysFromNow(-70) },
  { id: "txn_018", userId: "user_inv_08", type: "investment", amount: 1_200_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_015", description: "Investment in The Manuela — Waterfront Apartment Opportunity", createdAt: daysFromNow(-400) },
  { id: "txn_019", userId: "user_inv_08", type: "withdrawal", amount: 1_416_000, status: "completed", reference: ref(), relatedInvestmentId: "inv_015", description: "Withdrawal of matured investment proceeds", createdAt: daysFromNow(-35) },
  { id: "txn_020", userId: "user_inv_01", type: "deposit", amount: 500_000, status: "completed", reference: ref(), description: "Bank transfer deposit", createdAt: daysFromNow(-65) },
  { id: "txn_021", userId: "user_inv_04", type: "deposit", amount: 200_000, status: "completed", reference: ref(), description: "Bank transfer deposit", createdAt: daysFromNow(-25) },
  { id: "txn_022", userId: "user_inv_07", type: "deposit", amount: 600_000, status: "completed", reference: ref(), description: "Crypto deposit (USDT via TRC20)", createdAt: daysFromNow(-115) },
];
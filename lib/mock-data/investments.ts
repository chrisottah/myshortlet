// lib/mock-data/investments.ts

import { Investment } from "@/lib/types";

const now = new Date();
function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const investments: Investment[] = [
  {
    id: "inv_001", investorId: "user_inv_01", opportunityId: "opp_01",
    amount: 1_000_000, illustrativeReturnRate: 0.18, termMonths: 12,
    status: "active", investedAt: daysFromNow(-60), maturityDate: daysFromNow(305),
    earnings: 180_000, maturityValue: 1_180_000,
    createdAt: daysFromNow(-60), updatedAt: daysFromNow(-60),
  },
  {
    id: "inv_002", investorId: "user_inv_01", opportunityId: "opp_03",
    amount: 1_500_000, illustrativeReturnRate: 0.21, termMonths: 24,
    status: "active", investedAt: daysFromNow(-40), maturityDate: daysFromNow(690),
    earnings: 630_000, maturityValue: 2_130_000,
    createdAt: daysFromNow(-40), updatedAt: daysFromNow(-40),
  },
  {
    id: "inv_003", investorId: "user_inv_02", opportunityId: "opp_01",
    amount: 2_000_000, illustrativeReturnRate: 0.18, termMonths: 12,
    status: "active", investedAt: daysFromNow(-90), maturityDate: daysFromNow(275),
    earnings: 360_000, maturityValue: 2_360_000,
    createdAt: daysFromNow(-90), updatedAt: daysFromNow(-90),
  },
  {
    id: "inv_004", investorId: "user_inv_02", opportunityId: "opp_02",
    amount: 2_000_000, illustrativeReturnRate: 0.16, termMonths: 6,
    status: "matured", investedAt: daysFromNow(-200), maturityDate: daysFromNow(-15),
    earnings: 160_000, maturityValue: 2_160_000,
    createdAt: daysFromNow(-200), updatedAt: daysFromNow(-15),
  },
  {
    id: "inv_005", investorId: "user_inv_03", opportunityId: "opp_05",
    amount: 500_000, illustrativeReturnRate: 0.14, termMonths: 3,
    status: "matured", investedAt: daysFromNow(-100), maturityDate: daysFromNow(-10),
    earnings: 17_500, maturityValue: 517_500,
    createdAt: daysFromNow(-100), updatedAt: daysFromNow(-10),
  },
  {
    id: "inv_006", investorId: "user_inv_03", opportunityId: "opp_04",
    amount: 500_000, illustrativeReturnRate: 0.18, termMonths: 12,
    status: "pending", investedAt: daysFromNow(-1), maturityDate: daysFromNow(364),
    earnings: 90_000, maturityValue: 590_000,
    createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1),
  },
  {
    id: "inv_007", investorId: "user_inv_04", opportunityId: "opp_05",
    amount: 500_000, illustrativeReturnRate: 0.14, termMonths: 3,
    status: "active", investedAt: daysFromNow(-20), maturityDate: daysFromNow(70),
    earnings: 17_500, maturityValue: 517_500,
    createdAt: daysFromNow(-20), updatedAt: daysFromNow(-20),
  },
  {
    id: "inv_008", investorId: "user_inv_05", opportunityId: "opp_03",
    amount: 3_000_000, illustrativeReturnRate: 0.21, termMonths: 24,
    status: "active", investedAt: daysFromNow(-50), maturityDate: daysFromNow(680),
    earnings: 1_260_000, maturityValue: 4_260_000,
    createdAt: daysFromNow(-50), updatedAt: daysFromNow(-50),
  },
  {
    id: "inv_009", investorId: "user_inv_05", opportunityId: "opp_01",
    amount: 2_000_000, illustrativeReturnRate: 0.18, termMonths: 12,
    status: "approaching_maturity", investedAt: daysFromNow(-355), maturityDate: daysFromNow(10),
    earnings: 360_000, maturityValue: 2_360_000,
    createdAt: daysFromNow(-355), updatedAt: daysFromNow(-355),
  },
  {
    id: "inv_010", investorId: "user_inv_05", opportunityId: "opp_06",
    amount: 1_500_000, illustrativeReturnRate: 0.195, termMonths: 18,
    status: "matured", investedAt: daysFromNow(-560), maturityDate: daysFromNow(-20),
    earnings: 438_750, maturityValue: 1_938_750,
    createdAt: daysFromNow(-560), updatedAt: daysFromNow(-20),
  },
  {
    id: "inv_011", investorId: "user_inv_06", opportunityId: "opp_04",
    amount: 1_000_000, illustrativeReturnRate: 0.18, termMonths: 12,
    status: "active", investedAt: daysFromNow(-30), maturityDate: daysFromNow(335),
    earnings: 180_000, maturityValue: 1_180_000,
    createdAt: daysFromNow(-30), updatedAt: daysFromNow(-30),
  },
  {
    id: "inv_012", investorId: "user_inv_06", opportunityId: "opp_02",
    amount: 500_000, illustrativeReturnRate: 0.16, termMonths: 6,
    status: "active", investedAt: daysFromNow(-15), maturityDate: daysFromNow(165),
    earnings: 40_000, maturityValue: 540_000,
    createdAt: daysFromNow(-15), updatedAt: daysFromNow(-15),
  },
  {
    id: "inv_013", investorId: "user_inv_07", opportunityId: "opp_05",
    amount: 750_000, illustrativeReturnRate: 0.14, termMonths: 3,
    status: "matured", investedAt: daysFromNow(-110), maturityDate: daysFromNow(-20),
    earnings: 26_250, maturityValue: 776_250,
    createdAt: daysFromNow(-110), updatedAt: daysFromNow(-20),
  },
  {
    id: "inv_014", investorId: "user_inv_08", opportunityId: "opp_03",
    amount: 2_000_000, illustrativeReturnRate: 0.21, termMonths: 24,
    status: "active", investedAt: daysFromNow(-70), maturityDate: daysFromNow(660),
    earnings: 840_000, maturityValue: 2_840_000,
    createdAt: daysFromNow(-70), updatedAt: daysFromNow(-70),
  },
  {
    id: "inv_015", investorId: "user_inv_08", opportunityId: "opp_01",
    amount: 1_200_000, illustrativeReturnRate: 0.18, termMonths: 12,
    status: "withdrawn", investedAt: daysFromNow(-400), maturityDate: daysFromNow(-35),
    earnings: 216_000, maturityValue: 1_416_000,
    createdAt: daysFromNow(-400), updatedAt: daysFromNow(-35),
  },
];
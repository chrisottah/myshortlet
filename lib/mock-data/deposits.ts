// lib/mock-data/deposits.ts

import { Deposit } from "@/lib/types";

const now = new Date();
function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const deposits: Deposit[] = [
  { id: "dep_001", userId: "user_inv_01", method: "bank_transfer", amount: 500_000, status: "confirmed", bankReference: "GTB-8823914", createdAt: daysFromNow(-65), updatedAt: daysFromNow(-64) },
  { id: "dep_002", userId: "user_inv_07", method: "crypto", amount: 600_000, status: "confirmed", cryptoTxHash: "0x4a1f...9b2c", cryptoAsset: "USDT", cryptoNetwork: "TRC20", createdAt: daysFromNow(-115), updatedAt: daysFromNow(-114) },
  { id: "dep_003", userId: "user_inv_02", method: "bank_transfer", amount: 800_000, status: "pending_verification", bankReference: "ZEN-4471820", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "dep_004", userId: "user_inv_03", method: "bank_transfer", amount: 300_000, status: "pending_verification", bankReference: "ACC-1129384", createdAt: daysFromNow(0), updatedAt: daysFromNow(0) },
  { id: "dep_005", userId: "user_inv_04", method: "crypto", amount: 250_000, status: "pending_verification", cryptoTxHash: "0x7c2e...1f8a", cryptoAsset: "USDC", cryptoNetwork: "ERC20", createdAt: daysFromNow(0), updatedAt: daysFromNow(0) },
  { id: "dep_006", userId: "user_inv_06", method: "bank_transfer", amount: 450_000, status: "pending_verification", bankReference: "GTB-9982741", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "dep_007", userId: "user_inv_08", method: "bank_transfer", amount: 1_000_000, status: "pending_verification", bankReference: "UBA-5563218", createdAt: daysFromNow(0), updatedAt: daysFromNow(0) },
];
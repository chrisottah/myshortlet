// lib/mock-data/withdrawals.ts

import { Withdrawal } from "@/lib/types";

const now = new Date();
function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const withdrawals: Withdrawal[] = [
  { id: "wdr_001", userId: "user_inv_08", method: "bank_transfer", amount: 1_416_000, status: "completed", destinationBank: "UBA - 0456781234", createdAt: daysFromNow(-35), updatedAt: daysFromNow(-33) },
  { id: "wdr_002", userId: "user_inv_05", method: "bank_transfer", amount: 300_000, status: "pending_processing", destinationBank: "Zenith Bank - 0234567891", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "wdr_003", userId: "user_inv_02", method: "crypto", amount: 500_000, status: "pending_processing", destinationWalletAddress: "TQn9Y2...k7Lp", createdAt: daysFromNow(0), updatedAt: daysFromNow(0) },
  { id: "wdr_004", userId: "user_inv_01", method: "bank_transfer", amount: 150_000, status: "pending_processing", destinationBank: "GTBank - 0123456789", createdAt: daysFromNow(0), updatedAt: daysFromNow(0) },
  { id: "wdr_005", userId: "user_inv_06", method: "bank_transfer", amount: 200_000, status: "pending_processing", destinationBank: "First Bank - 0987654321", createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1) },
  { id: "wdr_006", userId: "user_inv_03", method: "crypto", amount: 100_000, status: "rejected", destinationWalletAddress: "0x9f3e...2c1d", createdAt: daysFromNow(-8), updatedAt: daysFromNow(-7) },
];
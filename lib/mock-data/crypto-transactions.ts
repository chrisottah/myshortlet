// lib/mock-data/crypto-transactions.ts

import { CryptoTransaction } from "@/lib/types";

const now = new Date();
function daysFromNow(days: number): string {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const cryptoTransactions: CryptoTransaction[] = [
  { id: "ctx_001", userId: "user_inv_07", direction: "deposit", asset: "USDT", network: "TRC20", amount: 600_000, txHash: "0x4a1f8b7e2c9d3a1f5e6b8c9d2a1f9b2c", status: "completed", createdAt: daysFromNow(-115), updatedAt: daysFromNow(-114) },
  { id: "ctx_002", userId: "user_inv_04", direction: "deposit", asset: "USDC", network: "ERC20", amount: 250_000, txHash: "0x7c2e1f8a9b3d4e5f6a7b8c9d1e2f3a4b", status: "confirming", createdAt: daysFromNow(0), updatedAt: daysFromNow(0) },
  { id: "ctx_003", userId: "user_inv_02", direction: "withdrawal", asset: "USDT", network: "TRC20", amount: 500_000, txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d", status: "pending", createdAt: daysFromNow(0), updatedAt: daysFromNow(0) },
  { id: "ctx_004", userId: "user_inv_05", direction: "deposit", asset: "BTC", network: "Bitcoin", amount: 1_800_000, txHash: "3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d", status: "confirmed", createdAt: daysFromNow(-45), updatedAt: daysFromNow(-45) },
];
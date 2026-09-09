// lib/mock-data/wallets.ts

import { Wallet } from "@/lib/types";

const now = new Date().toISOString();

export const wallets: Wallet[] = [
  { id: "wallet_inv_01", userId: "user_inv_01", availableBalance: 850_000, investedBalance: 2_500_000, earningsBalance: 180_000, updatedAt: now },
  { id: "wallet_inv_02", userId: "user_inv_02", availableBalance: 1_200_000, investedBalance: 4_000_000, earningsBalance: 310_000, updatedAt: now },
  { id: "wallet_inv_03", userId: "user_inv_03", availableBalance: 300_000, investedBalance: 1_000_000, earningsBalance: 65_000, updatedAt: now },
  { id: "wallet_inv_04", userId: "user_inv_04", availableBalance: 150_000, investedBalance: 500_000, earningsBalance: 22_000, updatedAt: now },
  { id: "wallet_inv_05", userId: "user_inv_05", availableBalance: 2_000_000, investedBalance: 6_500_000, earningsBalance: 540_000, updatedAt: now },
  { id: "wallet_inv_06", userId: "user_inv_06", availableBalance: 400_000, investedBalance: 1_500_000, earningsBalance: 90_000, updatedAt: now },
  { id: "wallet_inv_07", userId: "user_inv_07", availableBalance: 600_000, investedBalance: 750_000, earningsBalance: 40_000, updatedAt: now },
  { id: "wallet_inv_08", userId: "user_inv_08", availableBalance: 90_000, investedBalance: 3_200_000, earningsBalance: 275_000, updatedAt: now },
];
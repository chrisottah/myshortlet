// lib/types/finance.ts

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  investedBalance: number;
  earningsBalance: number;
  updatedAt: string;
}

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "investment"
  | "earning"
  | "reinvestment"
  | "refund";

export type TransactionStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string;
  relatedInvestmentId?: string;
  description: string;
  createdAt: string;
}

export type PaymentMethod = "bank_transfer" | "crypto";

export type DepositStatus = "pending_verification" | "confirmed" | "rejected";

export interface Deposit {
  id: string;
  userId: string;
  method: PaymentMethod;
  amount: number;
  status: DepositStatus;
  bankReference?: string;
  cryptoTxHash?: string;
  cryptoAsset?: string;
  cryptoNetwork?: string;
  createdAt: string;
  updatedAt: string;
}

export type WithdrawalStatus = "pending_processing" | "completed" | "rejected";

export interface Withdrawal {
  id: string;
  userId: string;
  method: PaymentMethod;
  amount: number;
  status: WithdrawalStatus;
  destinationBank?: string;
  destinationWalletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export type CryptoTxStatus =
  | "pending"
  | "confirming"
  | "confirmed"
  | "rejected"
  | "completed";

export interface CryptoTransaction {
  id: string;
  userId: string;
  direction: "deposit" | "withdrawal";
  asset: "USDT" | "USDC" | "BTC" | "ETH";
  network: string;
  amount: number;
  txHash: string;
  status: CryptoTxStatus;
  createdAt: string;
  updatedAt: string;
}
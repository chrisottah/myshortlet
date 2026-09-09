// lib/mock-data/seed.ts

import { investors, propertyOwners, adminUsers } from "./users";
import { wallets } from "./wallets";
import { properties } from "./properties";
import { opportunities } from "./opportunities";
import { investments } from "./investments";
import { transactions } from "./transactions";
import { deposits } from "./deposits";
import { withdrawals } from "./withdrawals";
import { cryptoTransactions } from "./crypto-transactions";
import { notifications } from "./notifications";

import { walletService } from "@/lib/services/wallet-service";
import { propertyService } from "@/lib/services/property-service";
import { investmentService } from "@/lib/services/investment-service";
import { transactionService } from "@/lib/services/transaction-service";
import { paymentService } from "@/lib/services/payment-service";
import { withdrawalService } from "@/lib/services/withdrawal-service";
import { notificationService } from "@/lib/services/notification-service";

let seeded = false;

/**
 * Populates every mock repository once. Safe to call multiple times
 * (guarded by `seeded`) — call this from a server-side entrypoint
 * (e.g. a root layout or a dedicated `ensureSeeded()` import) before
 * any service is read from.
 */
export function seedAll() {
  if (seeded) return;
  seeded = true;

  walletService.seedWallets(wallets);
  propertyService.seedProperties(properties);
  investmentService.seedOpportunities(opportunities);
  investmentService.seedInvestments(investments);
  transactionService.seedTransactions(transactions);
  paymentService.seedDeposits(deposits);
  withdrawalService.seedWithdrawals(withdrawals);
  notificationService.seedNotifications(notifications);

  // Crypto transactions don't have a dedicated service yet (folded
  // into paymentService/withdrawalService for deposits/withdrawals) —
  // exported here for any future direct use.
  void cryptoTransactions;

  // Users aren't behind a repository/service yet (auth comes in Phase 5) —
  // exported here so Phase 5's auth layer can import them directly.
  void investors;
  void propertyOwners;
  void adminUsers;
}

export {
  investors,
  propertyOwners,
  adminUsers,
  cryptoTransactions,
};
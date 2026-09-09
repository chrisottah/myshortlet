// lib/services/wallet-service.ts

import { MockRepository, generateId } from "./mock-db";
import { Wallet } from "@/lib/types";

const walletRepo = new MockRepository<Wallet>();

export const walletService = {
  getWalletByUserId(userId: string): Wallet | undefined {
    return walletRepo.findOneWhere((w) => w.userId === userId);
  },

  createWallet(userId: string): Wallet {
    const wallet: Wallet = {
      id: generateId("wal"),
      userId,
      availableBalance: 0,
      investedBalance: 0,
      earningsBalance: 0,
      updatedAt: new Date().toISOString(),
    };
    return walletRepo.create(wallet);
  },

  seedWallets(items: Wallet[]) {
    items.forEach((item) => walletRepo.create(item));
  },

  creditAvailable(userId: string, amount: number): Wallet {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    return walletRepo.update(wallet.id, {
      availableBalance: wallet.availableBalance + amount,
      updatedAt: new Date().toISOString(),
    })!;
  },

  debitAvailable(userId: string, amount: number): Wallet {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    if (wallet.availableBalance < amount) {
      throw new Error("Insufficient available balance");
    }
    return walletRepo.update(wallet.id, {
      availableBalance: wallet.availableBalance - amount,
      updatedAt: new Date().toISOString(),
    })!;
  },

  creditInvested(userId: string, amount: number): Wallet {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    return walletRepo.update(wallet.id, {
      investedBalance: wallet.investedBalance + amount,
      updatedAt: new Date().toISOString(),
    })!;
  },

  /**
   * Used when an investment matures and is withdrawn: moves the
   * principal out of investedBalance, earnings out of earningsBalance,
   * and credits both to availableBalance.
   */
  debitEarningsAndInvested(
    userId: string,
    principal: number,
    earnings: number
  ): Wallet {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    return walletRepo.update(wallet.id, {
      investedBalance: Math.max(0, wallet.investedBalance - principal),
      earningsBalance: Math.max(0, wallet.earningsBalance - earnings),
      availableBalance: wallet.availableBalance + principal + earnings,
      updatedAt: new Date().toISOString(),
    })!;
  },

  creditEarnings(userId: string, amount: number): Wallet {
    const wallet = this.getWalletByUserId(userId);
    if (!wallet) throw new Error("Wallet not found");
    return walletRepo.update(wallet.id, {
      earningsBalance: wallet.earningsBalance + amount,
      updatedAt: new Date().toISOString(),
    })!;
  },
};
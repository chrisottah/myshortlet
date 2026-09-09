// lib/services/withdrawal-service.ts

import { MockRepository, generateId } from "./mock-db";
import { Withdrawal, WithdrawalStatus, PaymentMethod } from "@/lib/types";
import { walletService } from "./wallet-service";
import { transactionService } from "./transaction-service";
import { notificationService } from "./notification-service";

const withdrawalRepo = new MockRepository<Withdrawal>();

export const withdrawalService = {
  getAll(): Withdrawal[] {
    return withdrawalRepo
      .findAll()
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  getByUserId(userId: string): Withdrawal[] {
    return this.getAll().filter((w) => w.userId === userId);
  },

  getPending(): Withdrawal[] {
    return this.getAll().filter((w) => w.status === "pending_processing");
  },

  seedWithdrawals(items: Withdrawal[]) {
    items.forEach((item) => withdrawalRepo.create(item));
  },

  requestWithdrawal(input: {
    userId: string;
    amount: number;
    method: PaymentMethod;
    destinationBank?: string;
    destinationWalletAddress?: string;
  }): Withdrawal {
    const wallet = walletService.getWalletByUserId(input.userId);
    if (!wallet || wallet.availableBalance < input.amount) {
      throw new Error("Insufficient available balance");
    }

    // Funds are held (debited) immediately on request; refunded if rejected.
    walletService.debitAvailable(input.userId, input.amount);

    const now = new Date().toISOString();
    const withdrawal: Withdrawal = {
      id: generateId("wdr"),
      userId: input.userId,
      method: input.method,
      amount: input.amount,
      status: "pending_processing",
      destinationBank: input.destinationBank,
      destinationWalletAddress: input.destinationWalletAddress,
      createdAt: now,
      updatedAt: now,
    };
    withdrawalRepo.create(withdrawal);

    transactionService.record({
      userId: input.userId,
      type: "withdrawal",
      amount: input.amount,
      status: "pending",
      description: `Withdrawal via ${input.method === "bank_transfer" ? "bank transfer" : "crypto"}`,
    });

    notificationService.notify({
      userId: input.userId,
      type: "withdrawal_update",
      title: "Withdrawal requested",
      message: `Your withdrawal of ₦${input.amount.toLocaleString()} is pending processing.`,
    });

    return withdrawal;
  },

  completeWithdrawal(withdrawalId: string): Withdrawal {
    const withdrawal = withdrawalRepo.findById(withdrawalId);
    if (!withdrawal) throw new Error("Withdrawal not found");

    notificationService.notify({
      userId: withdrawal.userId,
      type: "withdrawal_update",
      title: "Withdrawal completed",
      message: `₦${withdrawal.amount.toLocaleString()} has been sent.`,
    });

    return withdrawalRepo.update(withdrawalId, {
      status: "completed" as WithdrawalStatus,
      updatedAt: new Date().toISOString(),
    })!;
  },

  rejectWithdrawal(withdrawalId: string): Withdrawal {
    const withdrawal = withdrawalRepo.findById(withdrawalId);
    if (!withdrawal) throw new Error("Withdrawal not found");

    // Refund the held amount back to available balance.
    walletService.creditAvailable(withdrawal.userId, withdrawal.amount);

    notificationService.notify({
      userId: withdrawal.userId,
      type: "withdrawal_update",
      title: "Withdrawal rejected",
      message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} was rejected and refunded to your available balance.`,
    });

    return withdrawalRepo.update(withdrawalId, {
      status: "rejected" as WithdrawalStatus,
      updatedAt: new Date().toISOString(),
    })!;
  },
};
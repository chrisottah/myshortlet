// lib/services/payment-service.ts

import { MockRepository, generateId } from "./mock-db";
import { Deposit, DepositStatus, PaymentMethod } from "@/lib/types";
import { walletService } from "./wallet-service";
import { transactionService } from "./transaction-service";
import { notificationService } from "./notification-service";

const depositRepo = new MockRepository<Deposit>();

export const paymentService = {
  getAll(): Deposit[] {
    return depositRepo
      .findAll()
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  getByUserId(userId: string): Deposit[] {
    return this.getAll().filter((d) => d.userId === userId);
  },

  getPending(): Deposit[] {
    return this.getAll().filter((d) => d.status === "pending_verification");
  },

  seedDeposits(items: Deposit[]) {
    items.forEach((item) => depositRepo.create(item));
  },

  initiateBankDeposit(input: {
    userId: string;
    amount: number;
    bankReference: string;
  }): Deposit {
    const now = new Date().toISOString();
    const deposit: Deposit = {
      id: generateId("dep"),
      userId: input.userId,
      method: "bank_transfer",
      amount: input.amount,
      status: "pending_verification",
      bankReference: input.bankReference,
      createdAt: now,
      updatedAt: now,
    };
    depositRepo.create(deposit);

    transactionService.record({
      userId: input.userId,
      type: "deposit",
      amount: input.amount,
      status: "pending",
      description: `Bank transfer deposit (ref: ${input.bankReference})`,
    });

    notificationService.notify({
      userId: input.userId,
      type: "deposit_update",
      title: "Deposit submitted",
      message: `Your deposit of ₦${input.amount.toLocaleString()} is pending verification.`,
    });

    return deposit;
  },

  initiateCryptoDeposit(input: {
    userId: string;
    amount: number;
    cryptoAsset: string;
    cryptoNetwork: string;
    cryptoTxHash: string;
  }): Deposit {
    const now = new Date().toISOString();
    const deposit: Deposit = {
      id: generateId("dep"),
      userId: input.userId,
      method: "crypto",
      amount: input.amount,
      status: "pending_verification",
      cryptoAsset: input.cryptoAsset,
      cryptoNetwork: input.cryptoNetwork,
      cryptoTxHash: input.cryptoTxHash,
      createdAt: now,
      updatedAt: now,
    };
    depositRepo.create(deposit);

    transactionService.record({
      userId: input.userId,
      type: "deposit",
      amount: input.amount,
      status: "pending",
      description: `Crypto deposit (${input.cryptoAsset} via ${input.cryptoNetwork})`,
    });

    notificationService.notify({
      userId: input.userId,
      type: "deposit_update",
      title: "Crypto deposit submitted",
      message: `Your deposit of ${input.amount} ${input.cryptoAsset} is pending confirmation.`,
    });

    return deposit;
  },

  confirmDeposit(depositId: string): Deposit {
    const deposit = depositRepo.findById(depositId);
    if (!deposit) throw new Error("Deposit not found");

    walletService.creditAvailable(deposit.userId, deposit.amount);

    notificationService.notify({
      userId: deposit.userId,
      type: "deposit_update",
      title: "Deposit confirmed",
      message: `₦${deposit.amount.toLocaleString()} has been added to your available balance.`,
    });

    return depositRepo.update(depositId, {
      status: "confirmed" as DepositStatus,
      updatedAt: new Date().toISOString(),
    })!;
  },

  rejectDeposit(depositId: string): Deposit {
    const deposit = depositRepo.findById(depositId);
    if (!deposit) throw new Error("Deposit not found");

    notificationService.notify({
      userId: deposit.userId,
      type: "deposit_update",
      title: "Deposit rejected",
      message: `Your deposit of ₦${deposit.amount.toLocaleString()} could not be verified.`,
    });

    return depositRepo.update(depositId, {
      status: "rejected" as DepositStatus,
      updatedAt: new Date().toISOString(),
    })!;
  },
};
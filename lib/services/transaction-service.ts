// lib/services/transaction-service.ts

import { MockRepository, generateId } from "./mock-db";
import { Transaction, TransactionType, TransactionStatus } from "@/lib/types";

const transactionRepo = new MockRepository<Transaction>();

export const transactionService = {
  record(input: {
    userId: string;
    type: TransactionType;
    amount: number;
    status: TransactionStatus;
    relatedInvestmentId?: string;
    description: string;
  }): Transaction {
    const transaction: Transaction = {
      id: generateId("txn"),
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      status: input.status,
      reference: generateId("ref").toUpperCase(),
      relatedInvestmentId: input.relatedInvestmentId,
      description: input.description,
      createdAt: new Date().toISOString(),
    };
    return transactionRepo.create(transaction);
  },

  seedTransactions(items: Transaction[]) {
    items.forEach((item) => transactionRepo.create(item));
  },

  getByUserId(userId: string): Transaction[] {
    return transactionRepo
      .findWhere((t) => t.userId === userId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  getAll(): Transaction[] {
    return transactionRepo
      .findAll()
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  updateStatus(id: string, status: TransactionStatus) {
    return transactionRepo.update(id, { status });
  },
};
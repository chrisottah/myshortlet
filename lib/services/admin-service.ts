// lib/services/admin-service.ts

import { MockRepository, generateId } from "./mock-db";
import { AuditLog } from "@/lib/types";
import { investmentService } from "./investment-service";
import { propertyService } from "./property-service";
import { paymentService } from "./payment-service";
import { withdrawalService } from "./withdrawal-service";
import { transactionService } from "./transaction-service";

const auditLogRepo = new MockRepository<AuditLog>();

export const adminService = {
  logAction(input: {
    actorId: string;
    actorRole: "admin" | "system";
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Record<string, unknown>;
  }): AuditLog {
    const log: AuditLog = {
      id: generateId("log"),
      ...input,
      createdAt: new Date().toISOString(),
    };
    return auditLogRepo.create(log);
  },

  seedAuditLogs(items: AuditLog[]) {
    items.forEach((item) => auditLogRepo.create(item));
  },

  getAuditLogs(): AuditLog[] {
    return auditLogRepo
      .findAll()
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  getDashboardMetrics() {
    const pendingDeposits = paymentService.getPending();
    const pendingWithdrawals = withdrawalService.getPending();
    const pendingProperties = [
    ...propertyService.getByStatus("submitted"),
    ...propertyService.getByStatus("under_review"),
    ];
    const allTransactions = transactionService.getAll();

    const totalDepositVolume = paymentService
      .getAll()
      .filter((d) => d.status === "confirmed")
      .reduce((sum, d) => sum + d.amount, 0);

    const totalWithdrawalVolume = withdrawalService
      .getAll()
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + w.amount, 0);

    return {
      pendingDepositsCount: pendingDeposits.length,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingPropertiesCount: pendingProperties.length,
      totalDepositVolume,
      totalWithdrawalVolume,
      totalTransactions: allTransactions.length,
    };
  },
};
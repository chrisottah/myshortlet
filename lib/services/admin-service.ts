// lib/services/admin-service.ts

import { MockRepository, generateId } from "./mock-db";
import { AuditLog } from "@/lib/types";
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

  async getDashboardMetrics() {
    const pendingDeposits = await paymentService.getPending();
    const pendingWithdrawals = await withdrawalService.getPending();
    const [submitted, underReview] = await Promise.all([
      propertyService.getByStatus("submitted"),
      propertyService.getByStatus("under_review"),
    ]);
    const pendingProperties = [...submitted, ...underReview];
    const allTransactions = await transactionService.getAll();

    const allDeposits = await paymentService.getAll();
    const totalDepositVolume = allDeposits
      .filter((d) => d.status === "confirmed")
      .reduce((sum, d) => sum + Number(d.amountKobo / 100n), 0);

    const allWithdrawals = await withdrawalService.getAll();
    const totalWithdrawalVolume = allWithdrawals
      .filter((w) => w.status === "completed")
      .reduce((sum, w) => sum + Number(w.amountKobo / 100n), 0);

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
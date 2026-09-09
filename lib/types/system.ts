// lib/types/system.ts

export type NotificationType =
  | "investment_update"
  | "deposit_update"
  | "withdrawal_update"
  | "property_update"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: "admin" | "system";
  action: string; // e.g. "deposit.approved"
  targetType: string; // e.g. "Deposit"
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
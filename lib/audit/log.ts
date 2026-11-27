// lib/audit/log.ts
// Append-only audit log. Every admin action and every money action writes
// exactly one AuditLog row. This module exposes only `writeAudit` and
// `writeAuditInTx`; there is no update or delete.
//
// Design rules (from the handover doc, sections 8 and 10):
//  - Append-only. No mutation, no deletion.
//  - Never silently drop an audit row. But: a failed audit write must not
//    roll back a money transaction that has already succeeded. So:
//      * writeAudit()        — best effort; catches its own errors and logs.
//      * writeAuditInTx(tx)  — writes inside the caller's transaction; if it
//                              fails, the transaction fails. Use this when the
//                              audit row is part of the atomic money change.

import { prisma } from "@/lib/db";
import type { Prisma, AuditActorRole } from "@prisma/client";

export interface AuditInput {
  actorId?: string | null;
  actorRole: AuditActorRole;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}

function normalise(input: AuditInput): Prisma.AuditLogCreateInput {
  return {
    actorId: input.actorId ?? null,
    actorRole: input.actorRole,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    before:
      input.before === undefined
        ? undefined
        : (input.before as Prisma.InputJsonValue),
    after:
      input.after === undefined
        ? undefined
        : (input.after as Prisma.InputJsonValue),
    ip: input.ip ?? null,
  };
}

/**
 * Write an audit row using the shared Prisma client.
 * Best-effort: never throws, so it can be called after a money transaction
 * that has already committed.
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({ data: normalise(input) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[audit] failed to write audit row", {
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Write an audit row inside the caller's Prisma transaction.
 * Use this when the audit is part of an atomic money change: if the audit
 * fails, the transaction rolls back and no money moves without a record.
 */
export async function writeAuditInTx(
  tx: Prisma.TransactionClient,
  input: AuditInput
): Promise<void> {
  await tx.auditLog.create({ data: normalise(input) });
}
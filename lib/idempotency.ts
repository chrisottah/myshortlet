// lib/idempotency.ts
// Makes a money action safe to retry. The doc (section 6 and section 8)
// requires that webhook replays, double-clicks, and cron retries never
// double-credit or double-debit.
//
// Usage:
//
//   const result = await withIdempotency(
//     { scope: "deposit.confirm", key: depositId, userId },
//     async (tx) => {
//       // money writes using `tx`
//       return { credited: amount };
//     }
//   );
//
// Semantics:
//  - If (scope, key) has a stored result, return it and DO NOT run `fn`.
//  - Otherwise, run `fn` inside a transaction and store its result.
//  - If `fn` throws, no stored result is written; a retry re-runs `fn`.
//  - Concurrent calls with the same key: at most one runs `fn`; the others
//    wait, then return the same result.
//
// Implementation note: we use the unique constraint on IdempotencyKey.key as
// the concurrency primitive. Two parallel calls both try to INSERT the row;
// one wins, the loser catches the unique-violation (P2002), re-reads the row,
// and returns its stored result once the winner has finished.

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface IdempotencyKey {
  /** e.g. "deposit.confirm", "withdrawal.complete", "maturity.run" */
  scope: string;
  /** idempotency key, e.g. the deposit id, the maturity run id */
  key: string;
  /** optional user id this action belongs to (for scoping/cleanup) */
  userId?: string;
}

export class IdempotencyInFlight extends Error {
  constructor(public readonly scope: string, public readonly key: string) {
    super(`Another request is already processing ${scope}:${key}`);
    this.name = "IdempotencyInFlight";
  }
}

const IN_FLIGHT_TTL_MS = 60_000; // if a row is "in flight" longer than this, it's stale
const COMPLETED_TTL_MS = 7 * 24 * 60 * 60_000; // keep results for 7 days

interface StoredRow {
  status: "in_flight" | "done";
  result: unknown;
}

function rowKey(scope: string, key: string): string {
  return `${scope}:${key}`;
}

/**
 * Run `fn` exactly once per (scope, key) within the retention window.
 * `fn` receives a Prisma transaction client and MUST do all its money writes
 * through it, so that the result and the idempotency record commit together.
 */
export async function withIdempotency<T>(
  input: IdempotencyKey,
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  const composite = rowKey(input.scope, input.key);

  // Fast path: existing completed result?
  const existing = await prisma.idempotencyKey.findUnique({ where: { key: composite } });
  if (existing) {
    const stored = decode(existing);
    if (stored.status === "done") {
      return stored.result as T;
    }
    // Another request is in flight. Fail fast — the caller (usually a webhook
    // handler or cron) should retry later. Better than duplicate work.
    throw new IdempotencyInFlight(input.scope, input.key);
  }

  // Slow path: we need to claim the key, run fn, and store the result.
  // Step 1: try to claim.
  let claimed = false;
  try {
    await prisma.idempotencyKey.create({
      data: {
        key: composite,
        scope: input.scope,
        userId: input.userId ?? null,
        result: { status: "in_flight" } as Prisma.InputJsonValue,
        expiresAt: new Date(Date.now() + COMPLETED_TTL_MS),
      },
    });
    claimed = true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Lost the race. Re-read and either return the completed result or fail
      // as "in flight".
      const raced = await prisma.idempotencyKey.findUnique({ where: { key: composite } });
      if (raced) {
        const stored = decode(raced);
        if (stored.status === "done") return stored.result as T;
        throw new IdempotencyInFlight(input.scope, input.key);
      }
    }
    throw err;
  }

  if (!claimed) {
    // Shouldn't get here; defensive.
    throw new IdempotencyInFlight(input.scope, input.key);
  }

  // Step 2: run the work in a single transaction so the money writes and the
  // "done" update either both commit or both roll back.
  try {
    const result = await prisma.$transaction(async (tx) => {
      const out = await fn(tx);
      await tx.idempotencyKey.update({
        where: { key: composite },
        data: {
          result: { status: "done", result: out } as Prisma.InputJsonValue,
        },
      });
      return out;
    });
    return result;
  } catch (err) {
    // fn failed → release the claim so a retry can run.
    await prisma.idempotencyKey
      .delete({ where: { key: composite } })
      .catch(() => {
        /* stale claim cleanup; not fatal */
      });
    throw err;
  }
}

function decode(row: { result: Prisma.JsonValue; createdAt: Date; expiresAt: Date | null }): StoredRow {
  const v = row.result as { status?: string; result?: unknown } | null;
  if (!v || typeof v !== "object") {
    return { status: "in_flight", result: null };
  }
  // Stale in-flight rows (older than TTL) are treated as done=null so a stuck
  // process doesn't block forever.
  if (v.status === "in_flight") {
    const age = Date.now() - row.createdAt.getTime();
    if (age > IN_FLIGHT_TTL_MS) {
      return { status: "done", result: null };
    }
    return { status: "in_flight", result: null };
  }
  return { status: "done", result: v.result ?? null };
}
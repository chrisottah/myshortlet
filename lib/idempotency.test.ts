import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { withIdempotency, IdempotencyInFlight } from "./idempotency";

const SCOPE = "test.run";

describe("withIdempotency", () => {
  beforeEach(async () => {
    await prisma.idempotencyKey.deleteMany({
      where: { scope: SCOPE },
    });
    await prisma.systemConfig.deleteMany({ where: { key: { startsWith: "test.idem." } } });
  });

  it("runs fn exactly once for two concurrent calls with the same key", async () => {
    let calls = 0;
    const slowFn = async (): Promise<{ ok: true }> => {
      calls++;
      // small delay so the two promises overlap
      await new Promise((r) => setTimeout(r, 50));
      return { ok: true };
    };

    const [a, b] = await Promise.allSettled([
      withIdempotency({ scope: SCOPE, key: "k1", userId: "u1" }, slowFn),
      withIdempotency({ scope: SCOPE, key: "k1", userId: "u1" }, slowFn),
    ]);

    // Exactly one ran fn; the other got a stored result (or a clean in-flight).
    expect(calls).toBe(1);
    const fulfilled = [a, b].filter((r) => r.status === "fulfilled");
    expect(fulfilled.length).toBeGreaterThanOrEqual(1);
    if (fulfilled[0].status === "fulfilled") {
      expect(fulfilled[0].value).toEqual({ ok: true });
    }
  });

  it("returns the stored result on a second sequential call without running fn", async () => {
    let calls = 0;
    const fn = async (): Promise<{ n: number }> => {
      calls++;
      return { n: 42 };
    };

    const first = await withIdempotency({ scope: SCOPE, key: "k2" }, fn);
    const second = await withIdempotency({ scope: SCOPE, key: "k2" }, fn);

    expect(first).toEqual({ n: 42 });
    expect(second).toEqual({ n: 42 });
    expect(calls).toBe(1);
  });

  it("re-runs fn if the first call threw", async () => {
    let calls = 0;
    const flaky = async (): Promise<{ attempt: number }> => {
      calls++;
      if (calls === 1) throw new Error("boom");
      return { attempt: calls };
    };

    await expect(
      withIdempotency({ scope: SCOPE, key: "k3" }, flaky)
    ).rejects.toThrow("boom");
    // No completed row was stored, so a retry re-runs.
    const retry = await withIdempotency({ scope: SCOPE, key: "k3" }, flaky);
    expect(retry).toEqual({ attempt: 2 });
    expect(calls).toBe(2);
  });

  it("throws IdempotencyInFlight when a concurrent call is still running", async () => {
    const gate = deferred<void>();
    const fn = async (): Promise<{ ok: true }> => {
      await gate.promise;
      return { ok: true };
    };

    const p1 = withIdempotency({ scope: SCOPE, key: "k4" }, fn);
    // Give p1 a tick to claim the key.
    await new Promise((r) => setTimeout(r, 10));

    await expect(
      withIdempotency({ scope: SCOPE, key: "k4" }, fn)
    ).rejects.toBeInstanceOf(IdempotencyInFlight);

    gate.resolve();
    await expect(p1).resolves.toEqual({ ok: true });
  });
});

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
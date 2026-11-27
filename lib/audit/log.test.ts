import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { writeAudit } from "./log";

describe("writeAudit", () => {
  beforeEach(async () => {
    await prisma.auditLog.deleteMany({ where: { targetType: "TestTarget" } });
  });

  it("writes exactly one row with the given fields", async () => {
    await writeAudit({
      actorId: "user_admin_01",
      actorRole: "admin",
      action: "test.action",
      targetType: "TestTarget",
      targetId: "t_01",
      before: { a: 1 },
      after: { a: 2 },
      ip: "127.0.0.1",
    });

    const rows = await prisma.auditLog.findMany({ where: { targetType: "TestTarget" } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      actorId: "user_admin_01",
      actorRole: "admin",
      action: "test.action",
      targetId: "t_01",
      before: { a: 1 },
      after: { a: 2 },
      ip: "127.0.0.1",
    });
  });

  it("accepts null actorId (system actions)", async () => {
    await writeAudit({
      actorId: null,
      actorRole: "system",
      action: "cron.maturity",
      targetType: "TestTarget",
      targetId: "t_sys",
    });
    const row = await prisma.auditLog.findFirst({
      where: { targetId: "t_sys", targetType: "TestTarget" },
    });
    expect(row?.actorId).toBeNull();
    expect(row?.actorRole).toBe("system");
  });
});
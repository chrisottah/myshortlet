// lib/ledger/accounts.ts
// Canonical ledger account codes and an idempotent ensureAccount().

import type { Prisma } from "@prisma/client";

export const ACCOUNT = {
  /** User's available cash balance. Liability to the user. */
  WALLET_AVAILABLE: "wallet.available",
  /** User's principal locked in active investments. Liability. */
  WALLET_INVESTED: "wallet.invested",
  /** User's matured earnings. Liability. */
  WALLET_EARNINGS: "wallet.earnings",
  /** User's funds held for a pending withdrawal. Liability. */
  WALLET_HELD: "wallet.held",
  /** The platform's bank account where deposits land. Asset. */
  DEPOSITS_DESIGNATED: "deposits.designated",
  /** The platform's payouts account. Asset. */
  PAYOUTS: "payouts",
  /** The platform's accrued liability for investments that will mature. Liability. */
  ACCRUED_LIABILITY: "accrued.liability",
  /** Platform fee income. Revenue. */
  FEES: "fees",
} as const;

export type AccountCode = (typeof ACCOUNT)[keyof typeof ACCOUNT];

interface AccountDef {
  code: AccountCode;
  kind: "asset" | "liability" | "equity" | "revenue" | "expense";
  name: string;
  /** true = per-user account (userId required); false = platform account (userId null) */
  perUser: boolean;
}

const ACCOUNT_DEFS: Record<AccountCode, AccountDef> = {
  [ACCOUNT.WALLET_AVAILABLE]: { code: ACCOUNT.WALLET_AVAILABLE, kind: "liability", name: "Wallet — available", perUser: true },
  [ACCOUNT.WALLET_INVESTED]:  { code: ACCOUNT.WALLET_INVESTED,  kind: "liability", name: "Wallet — invested",  perUser: true },
  [ACCOUNT.WALLET_EARNINGS]:  { code: ACCOUNT.WALLET_EARNINGS,  kind: "liability", name: "Wallet — earnings",  perUser: true },
  [ACCOUNT.WALLET_HELD]:      { code: ACCOUNT.WALLET_HELD,      kind: "liability", name: "Wallet — held",      perUser: true },
  [ACCOUNT.DEPOSITS_DESIGNATED]: { code: ACCOUNT.DEPOSITS_DESIGNATED, kind: "asset", name: "Designated deposits", perUser: false },
  [ACCOUNT.PAYOUTS]:             { code: ACCOUNT.PAYOUTS,             kind: "asset", name: "Payouts",             perUser: false },
  [ACCOUNT.ACCRUED_LIABILITY]:   { code: ACCOUNT.ACCRUED_LIABILITY,   kind: "liability", name: "Accrued liability", perUser: false },
  [ACCOUNT.FEES]:                { code: ACCOUNT.FEES,                kind: "revenue", name: "Fees",                perUser: false },
};

/**
 * Get or create the ledger account for a code, within the caller's transaction.
 * For per-user accounts, userId is required. For platform accounts, userId must be null/omitted.
 */
export async function ensureAccount(
  tx: Prisma.TransactionClient,
  code: AccountCode,
  userId?: string
): Promise<string> {
  const def = ACCOUNT_DEFS[code];
  if (!def) throw new Error(`Unknown ledger account code: ${code}`);
  if (def.perUser && !userId) {
    throw new Error(`Account ${code} requires a userId`);
  }
  if (!def.perUser && userId) {
    throw new Error(`Account ${code} is a platform account; userId must be omitted`);
  }
  const found = await tx.ledgerAccount.findFirst({
    where: { code, userId: userId ?? null },
  });
  if (found) return found.id;
  const created = await tx.ledgerAccount.create({
    data: { code, kind: def.kind, name: def.name, userId: userId ?? null },
  });
  return created.id;
}
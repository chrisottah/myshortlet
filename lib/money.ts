// lib/money.ts
// All money in the DB is BigInt kobo. All money in frontend types is naira
// (number) or, at the boundary, BigInt kobo. Nothing else.

export const KOBO_PER_NAIRA = 100n;

export function nairaToKobo(naira: number | bigint): bigint {
  if (typeof naira === "bigint") return naira * KOBO_PER_NAIRA;
  return BigInt(Math.round(naira)) * KOBO_PER_NAIRA;
}

export function koboToNaira(kobo: bigint | number): number {
  return Number(typeof kobo === "bigint" ? kobo : BigInt(Math.round(kobo))) / 100;
}

/** Format kobo as "₦1,234.56" (naira, 2dp). Uses the ₦ symbol, which is correct for NGN. */
export function formatCurrencyKobo(kobo: bigint | number): string {
  const naira = koboToNaira(kobo);
  return `₦${naira.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format naira as "₦1,234.56". For places that already carry naira. */
export function formatCurrencyNaira(naira: number): string {
  return `₦${naira.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
// lib/mock-data/seed.ts
// Export barrel for the mock arrays. Real data lives in Postgres and is
// populated by prisma/seed.ts. These arrays are still imported by a few
// pages that haven't been ported yet (B1 continuation / B2 / B3). When the
// last importer is ported, this file is deleted in B7.

export { investors, propertyOwners, adminUsers } from "./users";
export { wallets } from "./wallets";
export { properties } from "./properties";
export { opportunities } from "./opportunities";
export { investments } from "./investments";
export { transactions } from "./transactions";
export { withdrawals } from "./withdrawals";
export { notifications } from "./notifications";
export { deposits } from "./deposits";
export { cryptoTransactions } from "./crypto-transactions";

/**
 * @deprecated No-op. Data now lives in Postgres and is seeded by
 * `prisma/seed.ts`. Kept so `app/layout.tsx` compiles until it's removed.
 */
export function seedAll() {
  // intentionally empty
}
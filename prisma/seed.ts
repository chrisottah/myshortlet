// prisma/seed.ts
// Run: npx prisma db seed   (or: npm run seed)
// Dev: SEED_MODE=dev (default) | Production reference: SEED_MODE=reference
//
// Dev mode mirrors lib/mock-data/* into the DB (naira → kobo, ledger-balanced).
// Reference mode (production) seeds ONLY reference data + one admin from env.

import { PrismaClient, Role, Tier, KycStatus, Prisma } from "@prisma/client";
import * as argon2 from "argon2";
import { encrypt } from "../lib/crypto/encrypt";
import { investors, propertyOwners, adminUsers } from "../lib/mock-data/users";
import { properties } from "../lib/mock-data/properties";
import { opportunities } from "../lib/mock-data/opportunities";
import { investments as mockInvestments } from "../lib/mock-data/investments";
import { wallets as mockWallets } from "../lib/mock-data/wallets";
import { withdrawals as mockWithdrawals } from "../lib/mock-data/withdrawals";
import { notifications as mockNotifications } from "../lib/mock-data/notifications";
import { INVESTMENT_CONFIG, getTotalReturnRate } from "../lib/config/investment";

const prisma = new PrismaClient();
const NAIRA = 100n; // 1 naira = 100 kobo
const kobo = (naira: number | bigint) => BigInt(naira) * NAIRA;

// ---------- shared reference data (used in BOTH modes) ----------

const NIGERIA = { id: "country_ng", code: "NG", name: "Nigeria", currency: "NGN" };

const REGIONS = [
  { id: "region_lagos", name: "Lagos State" },
  { id: "region_fct", name: "Federal Capital Territory" },
  { id: "region_rivers", name: "Rivers State" },
  { id: "region_oyo", name: "Oyo State" },
];

const CITIES: { id: string; regionId: string; name: string }[] = [
  { id: "city_lekki", regionId: "region_lagos", name: "Lekki" },
  { id: "city_vi", regionId: "region_lagos", name: "Victoria Island" },
  { id: "city_ikoyi", regionId: "region_lagos", name: "Ikoyi" },
  { id: "city_ajah", regionId: "region_lagos", name: "Ajah" },
  { id: "city_ikeja", regionId: "region_lagos", name: "Ikeja" },
  { id: "city_maitama", regionId: "region_fct", name: "Maitama" },
  { id: "city_wuse", regionId: "region_fct", name: "Wuse" },
  { id: "city_ph", regionId: "region_rivers", name: "Port Harcourt" },
  { id: "city_ibadan", regionId: "region_oyo", name: "Ibadan" },
];

const PROPERTY_CLASSES = INVESTMENT_CONFIG.tiers.map((tier, i) => ({
  tier: tier.id as Tier, // lowercase: starter | standard | select | premier
  name: tier.name,
  tagline: tier.tagline,
  minInvestmentKobo: kobo(tier.minInvestment),
  presetAmountsKobo: tier.presetAmounts.map((n) => kobo(n)),
  sortOrder: i,
  active: true,
}));

const RETURN_SCHEDULE = INVESTMENT_CONFIG.availableTerms.map((term) => ({
  termMonths: term,
  totalReturnRate: getTotalReturnRate(term).toString(),
}));

// ---------- dev-only helpers ----------

const DAY = 86_400_000;
const now = Date.now();

// Recomputed seed investments: valid terms only. Legacy snapshots are kept
// for investments whose original term was in {1,3,6,12}; invalid terms are
// reissued at 12 months and recomputed at the current schedule.
const DEV_INVESTMENTS = mockInvestments.map((inv) => {
  const term = [1, 3, 6, 12].includes(inv.termMonths) ? inv.termMonths : 12;
  const rate = getTotalReturnRate(term);
  const recomputed = inv.termMonths !== term;
  const earningsNaira = recomputed ? Math.round(inv.amount * rate) : inv.earnings;
  const maturityValueNaira = inv.amount + earningsNaira;
  const termDays = Math.max(
    1,
    Math.round((new Date(inv.maturityDate).getTime() - new Date(inv.investedAt).getTime()) / DAY)
  );
  const status: "withdrawn" | "matured" | "pending" | "approaching_maturity" | "active" =
    inv.status === "withdrawn"
      ? "withdrawn"
      : inv.status === "matured"
      ? "matured"
      : inv.status === "pending"
      ? "pending"
      : inv.status === "approaching_maturity"
      ? "approaching_maturity"
      : "active";
  return {
    id: inv.id,
    investorId: inv.investorId,
    opportunityId: inv.opportunityId,
    principalKobo: kobo(inv.amount),
    termMonths: term,
    totalReturnRate: recomputed ? rate.toFixed(6) : (inv.earnings / inv.amount).toFixed(6),
    termDays,
    investedAt: new Date(inv.investedAt),
    maturityDate: new Date(inv.maturityDate),
    earningsKobo: kobo(earningsNaira),
    maturityValueKobo: kobo(maturityValueNaira),
    status,
    maturedAt: inv.status === "matured" ? new Date(inv.maturityDate) : null,
  };
});

async function seedReference() {
  // Country / Region / City
  await prisma.country.upsert({
    where: { id: NIGERIA.id },
    create: NIGERIA,
    update: NIGERIA,
  });
  for (const r of REGIONS) {
    await prisma.region.upsert({
      where: { id: r.id },
      create: { ...r, countryId: NIGERIA.id },
      update: r,
    });
  }
  for (const c of CITIES) {
    await prisma.city.upsert({ where: { id: c.id }, create: c, update: c });
  }

  // Property classes (one row per tier)
  for (const pc of PROPERTY_CLASSES) {
    await prisma.propertyClass.upsert({
      where: { tier: pc.tier },
      create: pc,
      update: pc,
    });
  }

  // Return schedule — one row per term, effectiveFrom "now".
  // Idempotent: use the composite unique key (termMonths, effectiveFrom) that
  // we upsert against. We round effectiveFrom to the current day so re-runs
  // on the same day hit the existing row rather than creating duplicates.
  const effectiveFrom = startOfTodayUtc();
  for (const rs of RETURN_SCHEDULE) {
    await prisma.returnScheduleEntry.upsert({
      where: {
        termMonths_effectiveFrom: { termMonths: rs.termMonths, effectiveFrom },
      },
      create: {
        termMonths: rs.termMonths,
        totalReturnRate: rs.totalReturnRate,
        effectiveFrom,
      },
      update: { totalReturnRate: rs.totalReturnRate },
    });
  }

  // SystemConfig — §11 provisional values
  const config: [string, unknown][] = [
    ["return.headlineTermMonths", 12],
    ["return.effectiveFrom", effectiveFrom.toISOString()],
    ["term.startsAt", "investment_date"],
    ["opportunity.almostFundedPct", 0.95],
    ["maturity.approachingWindowDays", 14],
    ["property.maxImages", 10],
    ["withdrawal.requiresApprovalAboveKobo", kobo(500_000).toString()],
    ["earlyExit.penaltyType", "percentage_of_accrued"],
    ["earlyExit.penaltyPct", null],
    ["earlyExit.forfeitFraction", null],
    ["earlyExit.autoApproveCapKobo", null],
    ["legal.returnWording", "fixed return payable by MyShortlet at maturity, subject to the terms"],
    ["legal.termsVersion", "v0-draft"],
    ["legal.riskVersion", "v0-draft"],
  ];
  for (const [key, value] of config) {
    await prisma.systemConfig.upsert({
      where: { key },
      create: { key, value: value as never },
      update: { value: value as never },
    });
  }
}

async function seedProductionAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set for SEED_MODE=reference");
  }
  const passwordHash = await argon2.hash(password);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      firstName: "Platform",
      lastName: "Admin",
      role: Role.admin,
      emailVerifiedAt: new Date(),
      onboardingComplete: true,
      kycStatus: KycStatus.verified,
      adminProfile: { create: { permissions: ["*"] } },
    },
    update: {
      passwordHash,
      role: Role.admin,
      adminProfile: {
        upsert: { create: { permissions: ["*"] }, update: { permissions: ["*"] } },
      },
    },
  });
}

// ---------- dev-only seed ----------

async function seedDevUsers() {
  // Password: ChangeMe123! (dev only). Never used in production.
  const passwordHash = await argon2.hash("ChangeMe123!");
  const allUsers = [...investors, ...propertyOwners, ...adminUsers];

  for (const u of allUsers) {
    const created = await prisma.user.upsert({
      where: { id: u.id },
      create: {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone ?? null,
        role: u.role,
        emailVerifiedAt: new Date(u.createdAt),
        passwordHash,
        onboardingComplete: true,
        kycStatus: KycStatus.verified,
      },
      update: {},
    });

    if (u.role === "investor") {
      await prisma.investorProfile.upsert({
        where: { userId: created.id },
        create: {
          userId: created.id,
          riskTolerance: u.investmentProfile?.riskTolerance ?? null,
          monthlyBudgetKobo: u.investmentProfile?.monthlyBudget
            ? kobo(u.investmentProfile.monthlyBudget)
            : null,
          goals: u.investmentProfile?.goals ?? [],
          preferredAsset: u.cryptoPreference?.preferredAsset ?? null,
          preferredNetwork: u.cryptoPreference?.preferredNetwork ?? null,
        },
        update: {},
      });
      if (u.bankDetails) {
        const encrypted = encrypt(u.bankDetails.accountNumber);
        await prisma.bankAccount.upsert({
          where: {
            userId_bankName_accountNumber: {
              userId: created.id,
              bankName: u.bankDetails.bankName,
              accountNumber: encrypted,
            },
          },
          create: {
            userId: created.id,
            bankName: u.bankDetails.bankName,
            accountNumber: encrypted,
            accountName: u.bankDetails.accountName,
            verified: true,
            nameMatchStatus: "matched",
          },
          update: {},
        });
      }
    }

    if (u.role === "property_owner") {
      await prisma.partnerProfile.upsert({
        where: { userId: created.id },
        create: { userId: created.id, companyName: u.companyName ?? null },
        update: {},
      });
    }

    if (u.role === "admin") {
      await prisma.adminProfile.upsert({
        where: { userId: created.id },
        create: { userId: created.id, permissions: u.permissions },
        update: {},
      });
    }
  }
}

async function seedDevWallets() {
  for (const w of mockWallets) {
    await prisma.wallet.upsert({
      where: { userId: w.userId },
      create: {
        userId: w.userId,
        currency: "NGN",
        availableBalance: kobo(w.availableBalance),
        investedBalance: kobo(w.investedBalance),
        earningsBalance: kobo(w.earningsBalance),
      },
      update: {},
    });
  }
}

async function seedDevPropertiesAndOpportunities() {
  for (const p of properties) {
    await prisma.property.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        ownerId: p.ownerId,
        sourceType: "owner_offer",
        title: p.title,
        description: p.description,
        type: p.type,
        countryId: p.location.countryId,
        regionId: p.location.regionId,
        cityId: p.location.cityId,
        addressLine: p.location.address,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        maxGuests: p.maxGuests,
        amenities: p.amenities,
        status: p.status,
        acquisitionCostKobo: kobo(p.financials.acquisitionCost),
        estimatedAnnualRevenueKobo: kobo(p.financials.estimatedAnnualRevenue),
        occupancyRateEstimate: p.financials.occupancyRateEstimate.toString(),
        operatingCostEstimateKobo: kobo(p.financials.operatingCostEstimate),
        reviewNotes: (p.reviewNotes ?? []) as never,
      },
      update: {},
    });

    let position = 0;
    for (const url of p.images.slice(0, 10)) {
      await prisma.propertyImage.upsert({
        where: { propertyId_position: { propertyId: p.id, position } },
        create: { propertyId: p.id, storageKey: url, url, position, caption: null },
        update: {},
      });
      position++;
    }
  }

  for (const o of opportunities) {
    const tier = (
      o.minInvestment >= 2_500_000
        ? "premier"
        : o.minInvestment >= 1_000_000
        ? "select"
        : o.minInvestment >= 500_000
        ? "standard"
        : "starter"
    ) as Tier;
    const slug = o.id.replace(/^opp_/, "opportunity-");
    await prisma.opportunity.upsert({
      where: { id: o.id },
      create: {
        id: o.id,
        propertyId: o.propertyId,
        slug,
        title: o.title,
        summary: o.summary,
        tier,
        minInvestmentKobo: kobo(o.minInvestment),
        maxInvestmentKobo: o.maxInvestment ? kobo(o.maxInvestment) : null,
        targetAmountKobo: kobo(o.targetAmount),
        amountRaisedKobo: kobo(o.amountRaised),
        status: o.status,
        badges: o.badges,
        openDate: new Date(o.openDate),
        closeDate: new Date(o.closeDate),
      },
      update: {},
    });
  }
}

async function seedDevInvestments() {
  for (const inv of DEV_INVESTMENTS) {
    await prisma.investment.upsert({
      where: { id: inv.id },
      create: {
        id: inv.id,
        investorId: inv.investorId,
        opportunityId: inv.opportunityId,
        principalKobo: inv.principalKobo,
        termMonths: inv.termMonths,
        totalReturnRate: inv.totalReturnRate,
        termDays: inv.termDays,
        investedAt: inv.investedAt,
        maturityDate: inv.maturityDate,
        earningsKobo: inv.earningsKobo,
        maturityValueKobo: inv.maturityValueKobo,
        status: inv.status,
        maturedAt: inv.maturedAt,
      },
      update: {},
    });
  }
}

/**
 * Each investor gets one "seed.opening" ledger transaction that tops them up
 * so that (sum of ledger) === (wallet.available + invested + earnings).
 * Written atomically with the wallet's cached balances so they can never drift.
 * Production never has these rows.
 */
async function seedDevOpeningBalances() {
  // Platform account (singleton, userId = null)
  const depositsAccount = await ensureLedgerAccount(prisma, "deposits.designated", "asset", "Designated deposits");

  for (const w of mockWallets) {
    // The cached wallet already reflects the target total.
    const targetTotal = kobo(w.availableBalance) + kobo(w.investedBalance) + kobo(w.earningsBalance);

    // Sum of this user's existing ledger entries (0 on a fresh seed)
    const existing = await prisma.ledgerEntry.aggregate({
      where: { account: { userId: w.userId } },
      _sum: { amountKobo: true },
    });
    const current = existing._sum.amountKobo ?? 0n;
    const diff = targetTotal - current;
    if (diff <= 0n) continue;

    const userAvailable = await ensureLedgerAccount(
      prisma,
      "wallet.available",
      "liability",
      "Wallet — available",
      w.userId
    );

    await prisma.$transaction(async (tx) => {
      const txn = await tx.ledgerTransaction.create({
        data: {
          reference: `seed-opening:${w.userId}`,
          kind: "seed.opening",
          description: "Seed opening balance (dev only)",
        },
      });
      await tx.ledgerEntry.createMany({
        data: [
          { transactionId: txn.id, accountId: depositsAccount, amountKobo: -diff },
          { transactionId: txn.id, accountId: userAvailable, amountKobo: diff },
        ],
      });
    });
  }
}

async function seedDevTransactionsAndNotifications() {
  // Withdrawals (read-model rows for the demo; the ledger remains source of truth
  // for money, and B4 replaces this block with real withdrawal flow).
  for (const w of mockWithdrawals) {
    await prisma.withdrawal.upsert({
      where: { id: w.id },
      create: {
        id: w.id,
        userId: w.userId,
        method: w.method,
        amountKobo: kobo(w.amount),
        status:
          w.status === "pending_processing"
            ? "requested"
            : w.status === "completed"
            ? "completed"
            : "rejected",
        idempotencyKey: `seed-wdr:${w.id}`,
        destinationSnapshot: (w.destinationBank
          ? { bankName: w.destinationBank }
          : { walletAddress: w.destinationWalletAddress }) as never,
      },
      update: {},
    });
  }

  for (const n of mockNotifications) {
    await prisma.notification.upsert({
      where: { id: n.id },
      create: {
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: new Date(n.createdAt),
      },
      update: {},
    });
  }

  // NOTE: mock deposits are intentionally NOT seeded — lib/mock-data/deposits.ts
  // was never provided to the backend, and real deposits are wired in B4.
}

// ---------- helpers ----------

function startOfTodayUtc(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function ensureLedgerAccount(
  client: PrismaClient | Prisma.TransactionClient,
  code: string,
  kind: string,
  name: string,
  userId?: string
): Promise<string> {
  const found = await client.ledgerAccount.findFirst({
    where: { code, userId: userId ?? null },
  });
  if (found) return found.id;
  const row = await client.ledgerAccount.create({
    data: { code, kind, name, userId: userId ?? null },
  });
  return row.id;
}

// ---------- main ----------

async function main() {
  const mode =
    process.env.SEED_MODE ?? (process.env.NODE_ENV === "production" ? "reference" : "dev");

  if (process.env.NODE_ENV === "production" && mode !== "reference") {
    console.error("Refusing to run dev seed in production. Set SEED_MODE=reference.");
    process.exit(1);
  }

  console.log(`Seeding (mode=${mode})…`);
  await seedReference();

  if (mode === "reference") {
    await seedProductionAdmin();
    console.log("Reference seed complete. Admin from env created.");
    return;
  }

  await seedDevUsers();
  await seedDevWallets();
  await seedDevPropertiesAndOpportunities();
  await seedDevInvestments();
  await seedDevTransactionsAndNotifications();
  await seedDevOpeningBalances();

  await prisma.systemConfig.upsert({
    where: { key: "seed.isDev" },
    create: { key: "seed.isDev", value: true as never },
    update: { value: true as never },
  });

  console.log("Dev seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
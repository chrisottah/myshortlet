// lib/auth/adapters.ts
// Convert Prisma rows to the frontend's User union shapes.
// Used at the server boundary so frontend components don't need to change.

import type { Prisma } from "@prisma/client";
import type { Investor, PropertyOwner, AdminUser } from "@/lib/types";

export type PrismaUserFull = Prisma.UserGetPayload<{
  include: {
    investorProfile: true;
    partnerProfile: true;
    adminProfile: true;
    wallets: true;
    bankAccounts: true;
    cryptoAddresses: true;
  };
}>;

function base(u: PrismaUserFull) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone ?? undefined,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    emailVerified: u.emailVerifiedAt !== null,
    onboardingComplete: u.onboardingComplete,
  };
}

export function toFrontendInvestor(u: PrismaUserFull): Investor {
  if (u.role !== "investor") {
    throw new Error(`toFrontendInvestor called with role ${u.role}`);
  }
  const wallet = u.wallets[0];
  const bank = u.bankAccounts[0];
  return {
    ...base(u),
    role: "investor",
    investmentProfile: {
      riskTolerance:
        (u.investorProfile?.riskTolerance as Investor["investmentProfile"]["riskTolerance"]) ??
        "balanced",
      monthlyBudget: u.investorProfile?.monthlyBudgetKobo
        ? Number(u.investorProfile.monthlyBudgetKobo / 100n)
        : undefined,
      goals: u.investorProfile?.goals ?? [],
    },
    bankDetails: bank
      ? {
          bankName: bank.bankName,
          accountNumber: "", // never return the raw (encrypted) number to the client
          accountName: bank.accountName,
        }
      : undefined,
    cryptoPreference: u.investorProfile?.preferredAsset
      ? {
          preferredAsset: u.investorProfile.preferredAsset,
          preferredNetwork: u.investorProfile.preferredNetwork ?? "",
        }
      : undefined,
    walletId: wallet?.id ?? "",
    watchlist: [], // populate from WatchlistItem table when the watchlist page needs it
  };
}

export function toFrontendOwner(u: PrismaUserFull): PropertyOwner {
  if (u.role !== "property_owner") {
    throw new Error(`toFrontendOwner called with role ${u.role}`);
  }
  const bank = u.bankAccounts[0];
  return {
    ...base(u),
    role: "property_owner",
    companyName: u.partnerProfile?.companyName ?? undefined,
    bankDetails: bank
      ? { bankName: bank.bankName, accountNumber: "", accountName: bank.accountName }
      : undefined,
    propertyIds: [], // derived from Property.ownerId when needed
  };
}

export function toFrontendAdmin(u: PrismaUserFull): AdminUser {
  if (u.role !== "admin") {
    throw new Error(`toFrontendAdmin called with role ${u.role}`);
  }
  return {
    ...base(u),
    role: "admin",
    permissions: u.adminProfile?.permissions ?? [],
  };
}
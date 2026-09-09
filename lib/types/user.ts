// lib/types/user.ts

export type UserRole = "investor" | "property_owner" | "admin";

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface CryptoPreference {
  preferredAsset: "USDT" | "USDC" | "BTC" | "ETH";
  preferredNetwork: string; // e.g. "TRC20", "ERC20", "BEP20"
  walletAddress?: string;
}

export interface Investor extends BaseUser {
  role: "investor";
  investmentProfile: {
    riskTolerance: "conservative" | "balanced" | "growth";
    monthlyBudget?: number;
    goals?: string[];
  };
  bankDetails?: BankDetails;
  cryptoPreference?: CryptoPreference;
  walletId: string;
  watchlist: string[]; // opportunity IDs
}

export interface PropertyOwner extends BaseUser {
  role: "property_owner";
  companyName?: string;
  bankDetails?: BankDetails;
  propertyIds: string[];
}

export interface AdminUser extends BaseUser {
  role: "admin";
  permissions: string[];
}

export type User = Investor | PropertyOwner | AdminUser;
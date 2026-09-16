"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "./session";
import { investors, propertyOwners, adminUsers } from "@/lib/mock-data/users";
import { walletService } from "@/lib/services/wallet-service";
import { User, Investor } from "@/lib/types";

function findUserByEmail(email: string): User | undefined {
  const all: User[] = [...investors, ...propertyOwners, ...adminUsers];
  return all.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function findUserById(userId: string): User | undefined {
  const all: User[] = [...investors, ...propertyOwners, ...adminUsers];
  return all.find((u) => u.id === userId);
}

export async function loginWithEmail(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const user = email ? findUserByEmail(email) : undefined;

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent("No demo account found with that email.")}`
    );
  }

  await createSession(user);
  redirect("/");
}

export async function loginAsDemo(formData: FormData) {
  const userId = formData.get("userId") as string;
  const user = userId ? findUserById(userId) : undefined;
  if (!user) redirect("/login");

  await createSession(user);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export interface RegisterInvestorInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  riskTolerance: "conservative" | "balanced" | "growth";
  monthlyBudget: number;
  goals: string[];
  bankName: string;
  accountNumber: string;
  accountName: string;
  cryptoAsset?: "USDT" | "USDC" | "BTC" | "ETH";
  cryptoNetwork?: string;
}

export async function registerInvestor(input: RegisterInvestorInput) {
  const now = new Date().toISOString();
  const newUserId = `user_inv_${Date.now()}`;

  // NOTE: this user is NOT added to lib/mock-data/users.ts — it lives
  // entirely in the session cookie, which is what makes this reliable on
  // Vercel's serverless functions. The WALLET, however, is created for
  // real in the in-memory wallet repo (via walletService.createWallet),
  // so dashboard reads/deposits/withdrawals/investments all resolve
  // correctly for this user within the same server instance.
  const wallet = walletService.createWallet(newUserId);

  const newInvestor: Investor = {
    id: newUserId,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    role: "investor",
    createdAt: now,
    updatedAt: now,
    emailVerified: true,
    onboardingComplete: true,
    investmentProfile: {
      riskTolerance: input.riskTolerance,
      monthlyBudget: input.monthlyBudget,
      goals: input.goals,
    },
    bankDetails: {
      bankName: input.bankName,
      accountNumber: input.accountNumber,
      accountName: input.accountName,
    },
    cryptoPreference: input.cryptoAsset
      ? {
          preferredAsset: input.cryptoAsset,
          preferredNetwork: input.cryptoNetwork ?? "",
        }
      : undefined,
    walletId: wallet.id,
    watchlist: [],
  };

  await createSession(newInvestor);
}
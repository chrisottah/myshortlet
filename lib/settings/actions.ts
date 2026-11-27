"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto/encrypt";

export async function updateProfileAction(formData: FormData) {
  const session = await requireRole("investor");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!firstName || !lastName) {
    redirect("/dashboard/settings?error=" + encodeURIComponent("First and last name are required"));
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { firstName, lastName, phone: phone || null },
  });

  redirect("/dashboard/settings?success=" + encodeURIComponent("Profile updated"));
}

export async function updateBankDetailsAction(formData: FormData) {
  const session = await requireRole("investor");

  const bankName = String(formData.get("bankName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();

  if (!bankName || !accountNumber || !accountName) {
    redirect(
      "/dashboard/settings?error=" + encodeURIComponent("All bank detail fields are required")
    );
  }

  const encrypted = encrypt(accountNumber);

  await prisma.bankAccount.upsert({
    where: {
      userId_bankName_accountNumber: {
        userId: session.id,
        bankName,
        accountNumber: encrypted,
      },
    },
    create: {
      userId: session.id,
      bankName,
      accountNumber: encrypted,
      accountName,
      verified: false,
      nameMatchStatus: "pending",
    },
    update: { accountName },
  });

  redirect("/dashboard/settings?success=" + encodeURIComponent("Bank details updated"));
}

export async function updateCryptoPreferenceAction(formData: FormData) {
  const session = await requireRole("investor");

  const preferredAsset = String(formData.get("preferredAsset") ?? "");
  const preferredNetwork = String(formData.get("preferredNetwork") ?? "").trim();
  const walletAddress = String(formData.get("walletAddress") ?? "").trim();

  const validAssets = ["USDT", "USDC", "BTC", "ETH"] as const;
  if (!validAssets.includes(preferredAsset as (typeof validAssets)[number])) {
    redirect("/dashboard/settings?error=" + encodeURIComponent("Invalid crypto asset"));
  }
  if (!preferredNetwork) {
    redirect("/dashboard/settings?error=" + encodeURIComponent("Preferred network is required"));
  }

  await prisma.investorProfile.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      preferredAsset: preferredAsset as (typeof validAssets)[number],
      preferredNetwork,
    },
    update: {
      preferredAsset: preferredAsset as (typeof validAssets)[number],
      preferredNetwork,
    },
  });

  // A wallet address is a saved, whitelisted recipient — only create it if
  // an address was provided, and do not overwrite an existing verified one.
  if (walletAddress) {
    await prisma.cryptoAddress.upsert({
      where: {
        userId_asset_network_address: {
          userId: session.id,
          asset: preferredAsset as (typeof validAssets)[number],
          network: preferredNetwork,
          address: walletAddress,
        },
      },
      create: {
        userId: session.id,
        asset: preferredAsset as (typeof validAssets)[number],
        network: preferredNetwork,
        address: walletAddress,
        // Cooling period enforced at withdrawal time in B4; here it just isn't whitelisted yet.
        whitelistedAt: null,
      },
      update: {},
    });
  }

  redirect("/dashboard/settings?success=" + encodeURIComponent("Crypto preference updated"));
}

export async function updateInvestmentProfileAction(formData: FormData) {
  const session = await requireRole("investor");

  const riskTolerance = String(formData.get("riskTolerance") ?? "");
  const monthlyBudget = String(formData.get("monthlyBudget") ?? "").trim();
  const goalsRaw = String(formData.get("goals") ?? "");

  if (!["conservative", "balanced", "growth"].includes(riskTolerance)) {
    redirect("/dashboard/settings?error=" + encodeURIComponent("Invalid risk tolerance"));
  }

  let budgetKobo: bigint | null = null;
  if (monthlyBudget) {
    const n = Number(monthlyBudget);
    if (!Number.isFinite(n) || n < 0) {
      redirect("/dashboard/settings?error=" + encodeURIComponent("Invalid monthly budget"));
    }
    budgetKobo = BigInt(Math.round(n)) * 100n;
  }

  const goals = goalsRaw
    .split(",")
    .map((g) => g.trim())
    .filter((g) => g.length > 0);

  await prisma.investorProfile.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      riskTolerance,
      monthlyBudgetKobo: budgetKobo,
      goals,
    },
    update: {
      riskTolerance,
      monthlyBudgetKobo: budgetKobo,
      goals,
    },
  });

  redirect("/dashboard/settings?success=" + encodeURIComponent("Investment profile updated"));
}
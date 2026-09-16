"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, createSession } from "@/lib/auth/session";
import type { Investor } from "@/lib/types";

async function requireInvestor(): Promise<Investor> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "investor") {
    redirect("/dashboard/settings?error=Only+investors+can+edit+these+settings");
  }
  return user as Investor;
}

export async function updateProfileAction(formData: FormData) {
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const phone = formData.get("phone");

  if (
    !firstName ||
    typeof firstName !== "string" ||
    firstName.trim().length === 0 ||
    !lastName ||
    typeof lastName !== "string" ||
    lastName.trim().length === 0
  ) {
    redirect("/dashboard/settings?error=First+and+last+name+are+required");
  }

  const investor = await requireInvestor();

  const updated: Investor = {
    ...investor,
    firstName: (firstName as string).trim(),
    lastName: (lastName as string).trim(),
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
    updatedAt: new Date().toISOString(),
  };

  await createSession(updated);
  redirect("/dashboard/settings?success=Profile+updated");
}

export async function updateBankDetailsAction(formData: FormData) {
  const bankName = formData.get("bankName");
  const accountNumber = formData.get("accountNumber");
  const accountName = formData.get("accountName");

  if (
    !bankName ||
    typeof bankName !== "string" ||
    bankName.trim().length === 0 ||
    !accountNumber ||
    typeof accountNumber !== "string" ||
    accountNumber.trim().length === 0 ||
    !accountName ||
    typeof accountName !== "string" ||
    accountName.trim().length === 0
  ) {
    redirect("/dashboard/settings?error=All+bank+detail+fields+are+required");
  }

  const investor = await requireInvestor();

  const updated: Investor = {
    ...investor,
    bankDetails: {
      bankName: (bankName as string).trim(),
      accountNumber: (accountNumber as string).trim(),
      accountName: (accountName as string).trim(),
    },
    updatedAt: new Date().toISOString(),
  };

  await createSession(updated);
  redirect("/dashboard/settings?success=Bank+details+updated");
}

export async function updateCryptoPreferenceAction(formData: FormData) {
  const preferredAsset = formData.get("preferredAsset");
  const preferredNetwork = formData.get("preferredNetwork");
  const walletAddress = formData.get("walletAddress");

  if (
    !preferredAsset ||
    typeof preferredAsset !== "string" ||
    !preferredNetwork ||
    typeof preferredNetwork !== "string" ||
    preferredNetwork.trim().length === 0
  ) {
    redirect("/dashboard/settings?error=Preferred+asset+and+network+are+required");
  }

  const validAssets = ["USDT", "USDC", "BTC", "ETH"];
  if (!validAssets.includes(preferredAsset as string)) {
    redirect("/dashboard/settings?error=Invalid+crypto+asset");
  }

  const investor = await requireInvestor();

  const updated: Investor = {
    ...investor,
     cryptoPreference: {
      preferredAsset: preferredAsset as "USDT" | "USDC" | "BTC" | "ETH",
      preferredNetwork: (preferredNetwork as string).trim(),
      walletAddress:
        typeof walletAddress === "string" && walletAddress.trim()
          ? walletAddress.trim()
          : undefined,
    },
    updatedAt: new Date().toISOString(),
  };

  await createSession(updated);
  redirect("/dashboard/settings?success=Crypto+preference+updated");
}

export async function updateInvestmentProfileAction(formData: FormData) {
  const riskTolerance = formData.get("riskTolerance");
  const monthlyBudget = formData.get("monthlyBudget");
  const goalsRaw = formData.get("goals");

  if (
    !riskTolerance ||
    typeof riskTolerance !== "string" ||
    !["conservative", "balanced", "growth"].includes(riskTolerance)
  ) {
    redirect("/dashboard/settings?error=Invalid+risk+tolerance");
  }

  const investor = await requireInvestor();

  const parsedBudget =
    typeof monthlyBudget === "string" && monthlyBudget.trim()
      ? Number(monthlyBudget)
      : undefined;

  if (parsedBudget !== undefined && (!Number.isFinite(parsedBudget) || parsedBudget < 0)) {
    redirect("/dashboard/settings?error=Invalid+monthly+budget");
  }

  const goals =
    typeof goalsRaw === "string" && goalsRaw.trim().length > 0
      ? goalsRaw
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g.length > 0)
      : undefined;

  const updated: Investor = {
    ...investor,
    investmentProfile: {
      riskTolerance: riskTolerance as Investor["investmentProfile"]["riskTolerance"],
      monthlyBudget: parsedBudget,
      goals,
    },
    updatedAt: new Date().toISOString(),
  };

  await createSession(updated);
  redirect("/dashboard/settings?success=Investment+profile+updated");
}
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { paymentService } from "@/lib/services/payment-service";
import { withdrawalService } from "@/lib/services/withdrawal-service";
import type { PaymentMethod } from "@/lib/types";
import { nairaToKobo } from "@/lib/money";

function walletError(message: string): never {
  redirect(`/dashboard/wallet?error=${encodeURIComponent(message)}`);
}

function walletSuccess(message: string): never {
  redirect(`/dashboard/wallet?success=${encodeURIComponent(message)}`);
}

export async function submitDeposit(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const method = formData.get("method") as PaymentMethod;
  const amount = Number(formData.get("amount"));

  if (!amount || amount <= 0) {
    walletError("Enter a valid deposit amount.");
  }

  let cryptoAsset = "";
  let cryptoNetwork = "";
  let cryptoTxHash = "";
  let bankReference = "";

  if (method === "crypto") {
    cryptoAsset = (formData.get("cryptoAsset") as string) ?? "";
    cryptoNetwork = (formData.get("cryptoNetwork") as string) ?? "";
    cryptoTxHash = (formData.get("cryptoTxHash") as string) ?? "";
    if (!cryptoAsset || !cryptoNetwork || !cryptoTxHash) {
      walletError("Fill in all crypto deposit details.");
    }
  } else {
    bankReference = (formData.get("bankReference") as string) ?? "";
    if (!bankReference) {
      walletError("Enter your bank transfer reference.");
    }
  }

  try {
    if (method === "crypto") {
      await paymentService.initiateCryptoDeposit({
        userId: user.id,
        amountKobo: nairaToKobo(amount),
        cryptoAsset: cryptoAsset as "USDT" | "USDC" | "BTC" | "ETH",
        cryptoNetwork,
        cryptoTxHash,
      });
    } else {
      await paymentService.initiateBankDeposit({
        userId: user.id,
        amountKobo: nairaToKobo(amount),
        bankReference,
      });
    }
  } catch (err) {
    walletError(err instanceof Error ? err.message : "Deposit failed.");
  }

  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  walletSuccess("Deposit submitted — pending verification.");
}

export async function submitWithdrawal(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const method = formData.get("method") as PaymentMethod;
  const amount = Number(formData.get("amount"));

  if (!amount || amount <= 0) {
    walletError("Enter a valid withdrawal amount.");
  }

  let destinationBank = "";
  let destinationWalletAddress = "";

  if (method === "crypto") {
    destinationWalletAddress = (formData.get("destinationWalletAddress") as string) ?? "";
    if (!destinationWalletAddress) {
      walletError("Enter a destination wallet address.");
    }
  } else {
    destinationBank = (formData.get("destinationBank") as string) ?? "";
    if (!destinationBank) {
      walletError("Enter your destination bank account.");
    }
  }

  try {
    if (method === "crypto") {
      await withdrawalService.requestWithdrawal({
        userId: user.id,
        amount,
        method: "crypto",
        destinationWalletAddress,
      });
    } else {
      await withdrawalService.requestWithdrawal({
        userId: user.id,
        amount,
        method: "bank_transfer",
        destinationBank,
      });
    }
  } catch (err) {
    walletError(err instanceof Error ? err.message : "Withdrawal failed.");
  }

  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  walletSuccess("Withdrawal requested — pending processing.");
}
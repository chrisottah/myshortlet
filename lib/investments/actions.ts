"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { investmentService } from "@/lib/services/investment-service";

export async function withdrawInvestmentAction(formData: FormData) {
  const investmentId = formData.get("investmentId");
  if (!investmentId || typeof investmentId !== "string") {
    redirect("/dashboard/investments?error=Invalid+investment");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const investment = await investmentService.getInvestmentById(investmentId);
  if (!investment || investment.investorId !== user.id) {
    redirect("/dashboard/investments?error=Investment+not+found");
  }
  if (investment.status !== "matured") {
    redirect(
      "/dashboard/investments?error=Only+matured+investments+can+be+withdrawn"
    );
  }

  let errorMessage: string | null = null;
  try {
    await investmentService.markWithdrawn(investmentId);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Withdrawal failed";
  }

  if (errorMessage) {
    redirect(`/dashboard/investments?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/dashboard/investments?success=Investment+withdrawn+successfully");
}

export async function createInvestmentAction(formData: FormData) {
  const opportunityId = formData.get("opportunityId");
  const amountRaw = formData.get("amount");
  const termRaw = formData.get("termMonths");

  if (
    !opportunityId ||
    typeof opportunityId !== "string" ||
    !amountRaw ||
    typeof amountRaw !== "string" ||
    !termRaw ||
    typeof termRaw !== "string"
  ) {
    redirect("/opportunities?error=Invalid+investment+request");
  }

  const amount = Number(amountRaw);
  const termMonths = Number(termRaw);

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(termMonths) ||
    termMonths <= 0
  ) {
    redirect(`/opportunities/${opportunityId}?error=Invalid+amount+or+term`);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "investor") {
    redirect(
      `/opportunities/${opportunityId}?error=Only+investors+can+invest`
    );
  }

  let errorMessage: string | null = null;
  try {
    await investmentService.createInvestment({
      investorId: user.id,
      opportunityId,
      amount,
      termMonths,
    });
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Investment failed";
  }

  if (errorMessage) {
    redirect(
      `/opportunities/${opportunityId}?error=${encodeURIComponent(errorMessage)}`
    );
  }

  redirect("/dashboard/investments?success=Investment+submitted+successfully");
}
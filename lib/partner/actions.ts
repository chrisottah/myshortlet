"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, createSession } from "@/lib/auth/session";
import type { PropertyOwner, BankDetails } from "@/lib/types";

export async function updatePartnerProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "property_owner") {
    redirect("/login");
  }
  const owner = user as PropertyOwner;

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const bankName = String(formData.get("bankName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();

  if (!firstName || !lastName) {
    redirect("/partner/dashboard/settings?error=First%20and%20last%20name%20are%20required");
  }

  const bankDetails: BankDetails | undefined =
    bankName && accountNumber && accountName
      ? { bankName, accountNumber, accountName }
      : undefined;

  const updated: PropertyOwner = {
    ...owner,
    firstName,
    lastName,
    phone: phone || undefined,
    companyName: companyName || undefined,
    bankDetails,
    updatedAt: new Date().toISOString(),
  };

  await createSession(updated);

  redirect("/partner/dashboard/settings?success=Profile%20updated");
}
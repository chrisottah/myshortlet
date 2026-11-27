"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/crypto/encrypt";

export async function updatePartnerProfile(formData: FormData) {
  const session = await requireRole("property_owner");

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

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.id },
      data: { firstName, lastName, phone: phone || null },
    });

    if (companyName) {
      await tx.partnerProfile.upsert({
        where: { userId: session.id },
        create: { userId: session.id, companyName },
        update: { companyName },
      });
    }

    if (bankName && accountNumber && accountName) {
      const encrypted = encrypt(accountNumber);
      await tx.bankAccount.upsert({
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
        update: {},
      });
    }
  });

  redirect("/partner/dashboard/settings?success=Profile%20updated");
}
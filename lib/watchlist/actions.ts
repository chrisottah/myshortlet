"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";

export async function toggleWatchlistAction(formData: FormData) {
  const session = await requireRole("investor");

  const opportunityId = String(formData.get("opportunityId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "");

  if (!opportunityId) {
    redirect("/dashboard/watchlist?error=" + encodeURIComponent("Invalid opportunity"));
  }

  const existing = await prisma.watchlistItem.findUnique({
    where: { userId_opportunityId: { userId: session.id, opportunityId } },
  });

  let added: boolean;
  if (existing) {
    await prisma.watchlistItem.delete({ where: { id: existing.id } });
    added = false;
  } else {
    await prisma.watchlistItem.create({
      data: { userId: session.id, opportunityId },
    });
    added = true;
  }

  const destination = redirectTo || "/dashboard/watchlist";
  redirect(
    `${destination}?success=${encodeURIComponent(added ? "Added to watchlist" : "Removed from watchlist")}`
  );
}
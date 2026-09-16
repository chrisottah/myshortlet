"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, createSession } from "@/lib/auth/session";
import type { Investor } from "@/lib/types";

/**
 * Toggles an opportunity in the current investor's watchlist.
 * Since watchlist lives on the session-cookie user object (investors
 * aren't in mock-data/users.ts), this reads the user, mutates the
 * array, and re-writes the whole session cookie via createSession().
 */
export async function toggleWatchlistAction(formData: FormData) {
  const opportunityId = formData.get("opportunityId");
  const redirectTo = formData.get("redirectTo");

  if (!opportunityId || typeof opportunityId !== "string") {
    redirect("/dashboard/watchlist?error=Invalid+opportunity");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "investor") {
    redirect("/dashboard/watchlist?error=Only+investors+have+a+watchlist");
  }

  const investor = user as Investor;
  const alreadyWatching = investor.watchlist.includes(opportunityId);

  const updatedWatchlist = alreadyWatching
    ? investor.watchlist.filter((id) => id !== opportunityId)
    : [...investor.watchlist, opportunityId];

  const updatedInvestor: Investor = {
    ...investor,
    watchlist: updatedWatchlist,
    updatedAt: new Date().toISOString(),
  };

  await createSession(updatedInvestor);

  const destination =
    typeof redirectTo === "string" && redirectTo.length > 0
      ? redirectTo
      : "/dashboard/watchlist";

  redirect(
    `${destination}?success=${
      alreadyWatching ? "Removed+from+watchlist" : "Added+to+watchlist"
    }`
  );
}
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { investmentService } from "@/lib/services/investment-service";
import { WatchlistClient } from "@/components/dashboard/watchlist-client";
import type { Investor } from "@/lib/types";

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  const investor = user?.role === "investor" ? (user as Investor) : null;

  const opportunities = investor
    ? investor.watchlist
        .map((id) => investmentService.getOpportunityById(id))
        .filter((opp): opp is NonNullable<typeof opp> => Boolean(opp))
    : [];

  return (
    <Suspense fallback={null}>
      <WatchlistClient opportunities={opportunities} />
    </Suspense>
  );
}
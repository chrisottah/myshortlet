"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { toggleWatchlistAction } from "@/lib/watchlist/actions";
import type { InvestmentOpportunity } from "@/lib/types";

export function WatchlistClient({
  opportunities,
}: {
  opportunities: InvestmentOpportunity[];
}) {
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          Watchlist
        </h1>
        <p className="text-sm text-charcoal/60">
          Opportunities you are keeping an eye on.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {opportunities.length === 0 ? (
        <div className="rounded-xl border border-charcoal/10 bg-white py-10 text-center">
          <p className="text-sm text-charcoal/50">
            Your watchlist is empty.
          </p>
          <Link
            href="/opportunities"
            className="inline-block mt-3 text-sm text-emerald hover:underline"
          >
            Browse opportunities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-xl border border-charcoal/10 bg-white p-4 space-y-3"
            >
              <div>
                <p className="font-medium text-charcoal">{opp.title}</p>
                <p className="text-xs text-charcoal/50 line-clamp-2">
                  {opp.summary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-charcoal/50">Min. Investment</p>
                  <p className="text-charcoal font-medium">
                    {formatCurrency(opp.minInvestment)}
                  </p>
                </div>
                <div>
                  <p className="text-charcoal/50">Illustrative Return</p>
                  <p className="text-emerald font-medium">
                    {(opp.illustrativeReturnRate * 100).toFixed(0)}% p.a.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Link
                  href={`/opportunities/${opp.id}`}
                  className="text-xs px-3 py-2 rounded-lg border border-charcoal/15 hover:bg-charcoal/5"
                >
                  View Opportunity
                </Link>
                <form action={toggleWatchlistAction}>
                  <input type="hidden" name="opportunityId" value={opp.id} />
                  <input
                    type="hidden"
                    name="redirectTo"
                    value="/dashboard/watchlist"
                  />
                  <button
                    type="submit"
                    className="text-xs px-3 py-2 rounded-lg border border-charcoal/15 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
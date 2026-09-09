// components/marketing/opportunity-card.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InvestmentOpportunity } from "@/lib/types";

const BADGE_LABELS: Record<string, string> = {
  featured: "Featured",
  new: "New",
  almost_funded: "Almost Funded",
  popular: "Popular",
};

export function OpportunityCard({ opportunity }: { opportunity: InvestmentOpportunity }) {
  const progress = Math.min(
    100,
    Math.round((opportunity.amountRaised / opportunity.targetAmount) * 100)
  );

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="group block overflow-hidden rounded-card border border-charcoal/10 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative h-44 w-full bg-ivory-muted">
        <div className="absolute left-3 top-3 flex gap-2">
          {opportunity.badges.map((badge) => (
            <Badge key={badge} className="bg-emerald text-ivory">
              {BADGE_LABELS[badge]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="font-display text-base font-semibold text-charcoal group-hover:text-emerald">
          {opportunity.title}
        </h3>
        <p className="line-clamp-2 text-sm text-charcoal/60">{opportunity.summary}</p>

        <div className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-ivory-muted">
            <div
              className="h-full rounded-full bg-emerald"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-charcoal/50">
            <span>{progress}% funded</span>
            <span>{opportunity.termMonths} months</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-charcoal/10 pt-3">
          <div>
            <p className="text-xs text-charcoal/50">Min. Investment</p>
            <p className="text-sm font-semibold text-charcoal">
              ₦{opportunity.minInvestment.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-charcoal/50">Illustrative Return</p>
            <p className="text-sm font-semibold text-emerald">
              {(opportunity.illustrativeReturnRate * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
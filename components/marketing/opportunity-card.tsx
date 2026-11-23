import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { InvestmentOpportunity } from "@/lib/types";
import { getImageForId } from "@/lib/mock-data/stock-images";
import { getTierForMinInvestment } from "@/lib/config/investment";
import { getHeadlineReturn, getTermRange } from "@/lib/config/investment-engine";

const BADGE_LABELS: Record<string, string> = {
  featured: "Featured",
  new: "New",
  almost_funded: "Almost Funded",
  popular: "Popular",
};

export function OpportunityCard({
  opportunity,
  coverImage,
}: {
  opportunity: InvestmentOpportunity;
  coverImage?: string;
}) {
  const progress = Math.min(
    100,
    Math.round((opportunity.amountRaised / opportunity.targetAmount) * 100)
  );
  const tier = getTierForMinInvestment(opportunity.minInvestment);
  const headline = getHeadlineReturn();
  const { min, max } = getTermRange();

  return (
    <Link
      href={`/opportunities/${opportunity.id}`}
      className="group block overflow-hidden rounded-card border border-charcoal/10 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={coverImage ?? getImageForId(opportunity.id)}
          alt={opportunity.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 z-10 flex gap-2">
          {opportunity.badges.map((badge) => (
            <Badge key={badge} className="bg-emerald text-ivory">
              {BADGE_LABELS[badge]}
            </Badge>
          ))}
        </div>
        <span className="absolute right-3 top-3 z-10 rounded-full bg-charcoal/80 px-2.5 py-1 text-xs font-medium text-ivory">
          {tier.name}
        </span>
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
            <span>{min}–{max} months</span>
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
            <p className="text-xs text-charcoal/50">
              Illustrative Return ({headline.termMonths} mo)
            </p>
            <p className="text-sm font-semibold text-emerald">
              {(headline.totalReturnRate * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
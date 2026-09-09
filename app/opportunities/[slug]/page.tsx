// app/opportunities/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { InvestmentCalculator } from "@/components/marketing/investment-calculator";
import { Badge } from "@/components/ui/badge";
import { investmentService } from "@/lib/services/investment-service";
import { propertyService } from "@/lib/services/property-service";
import { MapPin, Bed, Bath, Users } from "lucide-react";

const BADGE_LABELS: Record<string, string> = {
  featured: "Featured",
  new: "New",
  almost_funded: "Almost Funded",
  popular: "Popular",
};

export function generateStaticParams() {
  const opportunities = investmentService.getOpportunities();
  return opportunities.map((o) => ({ slug: o.id }));
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = investmentService.getOpportunityById(slug);
  if (!opportunity) notFound();

  const property = propertyService.getById(opportunity.propertyId);
  const progress = Math.min(
    100,
    Math.round((opportunity.amountRaised / opportunity.targetAmount) * 100)
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/opportunities"
          className="text-sm font-medium text-charcoal/50 hover:text-charcoal"
        >
          ← Back to Opportunities
        </Link>

        {/* Gallery */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2">
          <div className="h-64 rounded-card bg-ivory-muted sm:col-span-2 sm:row-span-2 sm:h-full" />
          <div className="h-32 rounded-card bg-ivory-muted" />
          <div className="h-32 rounded-card bg-ivory-muted" />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              {opportunity.badges.map((badge) => (
                <Badge key={badge} className="bg-emerald text-ivory">
                  {BADGE_LABELS[badge]}
                </Badge>
              ))}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold text-charcoal sm:text-4xl">
              {opportunity.title}
            </h1>

            {property && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-charcoal/60">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {property.location.address}
                </span>
                <span className="flex items-center gap-1">
                  <Bed className="h-4 w-4" /> {property.bedrooms} beds
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" /> {property.bathrooms} baths
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {property.maxGuests} guests
                </span>
              </div>
            )}

            <p className="mt-6 leading-relaxed text-charcoal/70">
              {opportunity.summary}
            </p>

            {property && (
              <>
                <p className="mt-4 leading-relaxed text-charcoal/70">
                  {property.description}
                </p>

                <div className="mt-8">
                  <h3 className="font-display text-lg font-semibold text-charcoal">
                    Amenities
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {property.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-ivory-muted px-3 py-1 text-xs font-medium text-charcoal/70"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Funding progress */}
            <div className="mt-8 rounded-card border border-charcoal/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold text-charcoal">
                  ₦{opportunity.amountRaised.toLocaleString()} raised
                </span>
                <span className="text-sm text-charcoal/50">
                  of ₦{opportunity.targetAmount.toLocaleString()} target
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-ivory-muted">
                <div
                  className="h-full rounded-full bg-emerald"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-display text-lg font-bold text-charcoal">
                    {progress}%
                  </p>
                  <p className="text-xs text-charcoal/50">Funded</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-charcoal">
                    {opportunity.termMonths} mo
                  </p>
                  <p className="text-xs text-charcoal/50">Term</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-emerald">
                    {(opportunity.illustrativeReturnRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-charcoal/50">Illustrative Return</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column — calculator */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <InvestmentCalculator opportunity={opportunity} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
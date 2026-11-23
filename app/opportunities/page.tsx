// app/opportunities/page.tsx
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { OpportunitiesGrid } from "@/components/marketing/opportunities-grid";
import { investmentService } from "@/lib/services/investment-service";
import { propertyService } from "@/lib/services/property-service";
import { INVESTMENT_CONFIG } from "@/lib/config/investment";
import { getPropertyCover } from "@/lib/property-images";

const FROM = `₦${INVESTMENT_CONFIG.minInvestmentDefault.toLocaleString()}`;

export const metadata = {
  title: "Investment Opportunities — MyShortlet",
  description: `Browse vetted short-let investment opportunities across Nigeria and start from ${FROM}.`,
};

export default function OpportunitiesPage() {
  const opportunities = investmentService.getOpportunities();

  const coverImages: Record<string, string> = {};
  for (const opp of opportunities) {
    coverImages[opp.id] = getPropertyCover(propertyService.getById(opp.propertyId), opp.id);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
            Investment Opportunities
          </h1>
          <p className="mt-3 text-charcoal/60">
            Browse vetted short-let opportunities by tier, filter by what
            matters to you, and start investing from {FROM}.
          </p>
        </div>

        <OpportunitiesGrid opportunities={opportunities} coverImages={coverImages} />
      </main>
      <Footer />
    </>
  );
}
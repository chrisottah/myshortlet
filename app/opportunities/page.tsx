// app/opportunities/page.tsx
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { OpportunitiesGrid } from "@/components/marketing/opportunities-grid";
import { investmentService } from "@/lib/services/investment-service";

export const metadata = {
  title: "Investment Opportunities — MyShortlet",
  description:
    "Browse vetted short-let investment opportunities across Nigeria and start from ₦100,000.",
};

export default function OpportunitiesPage() {
  const opportunities = investmentService.getOpportunities();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-bold text-charcoal sm:text-4xl">
            Investment Opportunities
          </h1>
          <p className="mt-3 text-charcoal/60">
            Browse vetted short-let opportunities, filter by what matters to
            you, and start investing from ₦100,000.
          </p>
        </div>

        <OpportunitiesGrid opportunities={opportunities} />
      </main>
      <Footer />
    </>
  );
}
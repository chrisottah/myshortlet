// app/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { OpportunityCard } from "@/components/marketing/opportunity-card";
import { Button } from "@/components/ui/button";
import { investmentService } from "@/lib/services/investment-service";
import { TrendingUp, ShieldCheck, Wallet, ArrowRightLeft } from "lucide-react";

const HOW_IT_WORKS = [
  {
    icon: ShieldCheck,
    title: "We vet the property",
    description: "Every listing goes through a review of its location, financials, and demand before it's opened for investment.",
  },
  {
    icon: TrendingUp,
    title: "You choose an opportunity",
    description: "Browse vetted short-let opportunities and pick an amount and term that fits your goals.",
  },
  {
    icon: Wallet,
    title: "Your capital gets to work",
    description: "Funds are pooled toward the opportunity, and your investment is tracked from day one.",
  },
  {
    icon: ArrowRightLeft,
    title: "Receive returns at maturity",
    description: "At the end of the term, withdraw your capital plus illustrative earnings, or reinvest.",
  },
];

export default function Home() {
  const opportunities = investmentService.getOpportunities();
  const featured = opportunities
    .filter((o) => o.badges.includes("featured") || o.badges.includes("popular"))
    .slice(0, 3);

  const totalRaised = opportunities.reduce((sum, o) => sum + o.amountRaised, 0);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-charcoal">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold leading-tight text-ivory sm:text-5xl lg:text-6xl">
                Put your money to work in short-let opportunities.
              </h1>
              <p className="mt-6 text-lg text-ivory/70">
                Explore vetted short-let investment opportunities across
                Nigeria and grow your capital with illustrative returns,
                starting from ₦100,000.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/opportunities">
                  <Button size="lg" className="bg-emerald text-ivory hover:bg-emerald/90">
                    Explore Opportunities
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust stats */}
        <section className="border-b border-charcoal/10 bg-ivory-muted">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-charcoal/40">
              Demo Platform Statistics
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div>
                <p className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                  ₦{(totalRaised / 1_000_000).toFixed(0)}M+
                </p>
                <p className="text-sm text-charcoal/60">Capital Raised (Demo)</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-charcoal sm:text-3xl">
                  {opportunities.length}
                </p>
                <p className="text-sm text-charcoal/60">Active Opportunities (Demo)</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-charcoal sm:text-3xl">8+</p>
                <p className="text-sm text-charcoal/60">Investors Onboard (Demo)</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-charcoal sm:text-3xl">18%</p>
                <p className="text-sm text-charcoal/60">Avg. Illustrative Return (Demo)</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-display text-3xl font-bold text-charcoal">How It Works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-charcoal/60">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured opportunities */}
        <section className="bg-ivory-muted py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl font-bold text-charcoal">
                Featured Opportunities
              </h2>
              <Link href="/opportunities" className="text-sm font-medium text-emerald hover:underline">
                View all →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </div>
        </section>

        {/* Property owner CTA */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-card bg-charcoal px-8 py-14 text-center sm:px-16">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Own a short-let property?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ivory/70">
              List your property with MyShortlet and get access to investor
              capital to fund improvements, furnishing, or expansion.
            </p>
            <Link href="/partner/apply">
              <Button size="lg" className="mt-8 bg-emerald text-ivory hover:bg-emerald/90">
                Submit Your Property
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
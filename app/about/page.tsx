import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Building2, Target } from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Vetted, not just listed",
    description:
      "Every property submitted to MyShortlet is reviewed by our team — ownership, financials, and demand — before it's opened for investment.",
  },
  {
    icon: Building2,
    title: "Not a marketplace",
    description:
      "MyShortlet is an investment platform, not a property marketplace. You're not buying property or a fraction of it — you're funding a fixed-term opportunity.",
  },
  {
    icon: Target,
    title: "Built for transparency",
    description:
      "Every figure on MyShortlet is labeled illustrative, demo, or projected. We never present returns as guaranteed.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-charcoal">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-champagne">
              About Us
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-ivory sm:text-5xl">
              Making short-let real estate investment simple and transparent.
            </h1>
          </div>
        </section>

        {/* Body */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <p className="text-lg text-charcoal/70">
            MyShortlet is an investment platform that connects members of the
            public with vetted short-let apartment opportunities. Property
            owners submit their apartments to us, our team vets each one, and
            approved listings are opened to investors who fund them for a
            fixed term in exchange for illustrative returns at maturity.
          </p>
          <p className="mt-6 text-lg text-charcoal/70">
            Our goal is to make short-let real estate investment accessible —
            starting in Lagos, Nigeria, with plans to expand.
          </p>
        </section>

        {/* Pillars */}
        <section className="bg-ivory-muted py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-3xl font-bold text-charcoal">
              What we stand for
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {PILLARS.map((pillar) => (
                <div key={pillar.title} className="rounded-card bg-ivory p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-charcoal">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm text-charcoal/60">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-card border border-charcoal/10 px-6 py-5">
            <p className="text-sm text-charcoal/60">
              MyShortlet is currently a demo platform. No real payments,
              crypto, or banking integrations are active, and all figures
              shown are illustrative or projected.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-card bg-charcoal px-8 py-14 text-center sm:px-16">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Own a short-let property?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ivory/70">
              List your property with MyShortlet and get access to investor
              capital.
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
import Link from "next/link";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import {
  Search,
  Calculator,
  Wallet,
  LineChart,
  ArrowRightLeft,
} from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Browse vetted opportunities",
    description:
      "Every property listed on MyShortlet has been reviewed and vetted by our team before it's opened for investment.",
  },
  {
    icon: Calculator,
    title: "Choose your investment",
    description:
      "Pick an opportunity, use the calculator to see illustrative returns, and decide how much to invest for the listed term.",
  },
  {
    icon: Wallet,
    title: "Fund your investment",
    description:
      "Transfer funds from your MyShortlet wallet. Your capital is allocated to that specific opportunity for its fixed term.",
  },
  {
    icon: LineChart,
    title: "Track performance",
    description:
      "Follow your investment's progress from your dashboard until it reaches maturity.",
  },
  {
    icon: ArrowRightLeft,
    title: "Receive your return",
    description:
      "At maturity, your principal plus illustrative earnings are credited to your wallet — withdraw via bank transfer or crypto.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-charcoal">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-champagne">
              How It Works
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-ivory sm:text-5xl">
              From browsing to withdrawal, here&apos;s the full journey.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ivory/70">
              MyShortlet lets you invest in vetted short-let apartment
              opportunities for a fixed term, with illustrative returns at
              maturity.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-4xl px-6 py-20">
          <ol className="space-y-10">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                    <step.icon className="h-5 w-5" />
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-charcoal/10" />
                  )}
                </div>
                <div className="pb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-charcoal">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-charcoal/60">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Disclaimer */}
        <section className="bg-ivory-muted">
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="rounded-card border border-charcoal/10 bg-ivory px-6 py-5">
              <p className="text-sm text-charcoal/60">
                All returns shown on MyShortlet are illustrative and
                projected, not guaranteed. This is a demo platform — no real
                payments, crypto, or banking integrations are active.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="rounded-card bg-charcoal px-8 py-14 text-center sm:px-16">
            <h2 className="font-display text-3xl font-bold text-ivory">
              Ready to explore opportunities?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-ivory/70">
              Browse vetted short-let investment opportunities and see
              illustrative returns for yourself.
            </p>
            <Link href="/opportunities">
              <Button size="lg" className="mt-8 bg-emerald text-ivory hover:bg-emerald/90">
                Explore Opportunities
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
import Link from "next/link";
import { TrendingUp, Users, FileCheck, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Unlock capital",
    description:
      "Fund acquisitions, furnishing, or expansion through vetted investors — without taking on debt.",
  },
  {
    icon: Users,
    title: "Reach real investors",
    description:
      "Your listing reaches members actively browsing opportunities and ready to fund them.",
  },
  {
    icon: FileCheck,
    title: "Vetted, not open-ended",
    description:
      "One clear submission, one review process. No back-and-forth chasing.",
  },
];

const STATS = [
  { value: "24–48h", label: "Typical review turnaround" },
  { value: "0%", label: "Listing fee to apply" },
  { value: "6", label: "Simple steps to submit" },
];

const STEPS = [
  { title: "Submit your property", body: "Share details, photos, and projected financials — takes about 10 minutes." },
  { title: "We review it", body: "Our team vets the numbers and the property before anything goes live." },
  { title: "It gets listed", body: "Approved properties are shown to investors as a funding opportunity." },
  { title: "You receive capital", body: "Once funded, capital is released and you manage the property as agreed." },
];

export default async function PartnerLandingPage() {
  const user = await getCurrentUser();
  const isOwner = user?.role === "property_owner";

  const ctaHref = isOwner ? "/partner/dashboard" : "/partner/apply";
  const ctaLabel = isOwner ? "Go to your dashboard" : "Apply as a property owner";

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-charcoal text-ivory">
          <div className="mx-auto max-w-5xl px-6 pt-24 pb-16 text-center">
            <p className="text-emerald text-sm font-medium tracking-wide uppercase">
              For Property Owners
            </p>
            <h1 className="mt-4 font-display text-4xl md:text-6xl leading-tight">
              Turn your property into a<br className="hidden md:block" /> funded opportunity
            </h1>
            <p className="mt-6 text-ivory/60 max-w-xl mx-auto text-lg">
              List your short-let property, get vetted, and let our investor
              network fund it — fast.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href={ctaHref}>
                <Button className="bg-emerald hover:bg-emerald/90 text-ivory px-7 py-6 text-base gap-2">
                  {ctaLabel}
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stat strip */}
          <div className="border-t border-ivory/10">
            <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-3 gap-6 text-center">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl md:text-3xl text-ivory">{s.value}</p>
                  <p className="text-ivory/50 text-xs md:text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-ivory-muted">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="max-w-xl mb-12">
              <h2 className="font-display text-3xl text-charcoal">Why list with us</h2>
              <p className="text-charcoal/60 mt-3">
                Built for owners who want funding without the friction of traditional lenders.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="rounded-card bg-white border border-charcoal/10 p-7"
                  >
                    <div className="h-11 w-11 rounded-full bg-emerald/10 text-emerald flex items-center justify-center mb-5">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display text-lg text-charcoal">{b.title}</h3>
                    <p className="text-sm text-charcoal/60 mt-2 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="max-w-xl mb-12">
              <h2 className="font-display text-3xl text-charcoal">How it works</h2>
              <p className="text-charcoal/60 mt-3">
                Four steps from submission to funded property.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-9 w-9 rounded-full bg-charcoal text-ivory flex items-center justify-center text-sm font-medium shrink-0">
                      {i + 1}
                    </div>
                    {i < STEPS.length - 1 && i % 2 === 0 && (
                      <div className="hidden md:block w-px flex-1 bg-charcoal/10 mt-2" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-medium text-charcoal">{step.title}</h3>
                    <p className="text-sm text-charcoal/60 mt-1 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-charcoal text-ivory">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <h2 className="font-display text-3xl">Ready to submit your property?</h2>
            <p className="text-ivory/60 mt-3 max-w-md mx-auto">
              It takes about 10 minutes. Our team reviews every submission personally.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href={ctaHref}>
                <Button className="bg-emerald hover:bg-emerald/90 text-ivory px-7 py-6 text-base gap-2">
                  {ctaLabel}
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
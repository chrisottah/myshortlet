// components/marketing/footer.tsx
import Link from "next/link";
import { Wordmark } from "@/components/shared/wordmark";

export function Footer() {
  return (
    <footer className="border-t border-charcoal/10 bg-charcoal text-ivory">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark variant="light" />
            <p className="mt-3 text-sm text-ivory/60">
              Invest in vetted short-let opportunities, from anywhere.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ivory">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-ivory/60">
              <li><Link href="/opportunities">Investment Opportunities</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
              <li><Link href="/partner">For Property Owners</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ivory">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-ivory/60">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold text-ivory">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-ivory/60">
              <li><Link href="/login">Log In</Link></li>
              <li><Link href="/register">Get Started</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ivory/10 pt-6">
          <p className="text-xs leading-relaxed text-ivory/50">
            Demo platform: All investment figures, projected returns, property
            data and financial statistics shown in this prototype are
            illustrative and do not constitute an offer, guarantee,
            solicitation or financial advice. Actual investment terms,
            eligibility, fees, risks, returns and withdrawal conditions will
            be subject to the applicable MyShortlet offering documentation
            and regulatory requirements.
          </p>
        </div>
      </div>
    </footer>
  );
}
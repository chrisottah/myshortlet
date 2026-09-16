// components/marketing/investment-calculator.tsx
"use client";

import { useMemo, useState } from "react";
import { InvestmentOpportunity } from "@/lib/types";
import { buildInvestmentCalculation } from "@/lib/config/investment-engine";
import { INVESTMENT_CONFIG } from "@/lib/config/investment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createInvestmentAction } from "@/lib/investments/actions";

export function InvestmentCalculator({
  opportunity,
}: {
  opportunity: InvestmentOpportunity;
}) {
  const presets = INVESTMENT_CONFIG.presetAmounts.filter(
    (amt) => amt >= opportunity.minInvestment
  );

  const [amount, setAmount] = useState<number>(
    presets[0] ?? opportunity.minInvestment
  );
  const [customAmount, setCustomAmount] = useState<string>("");
  const [term, setTerm] = useState<number>(opportunity.termMonths);

  const activeAmount = customAmount ? Number(customAmount) || 0 : amount;

  const calc = useMemo(() => {
    if (activeAmount < opportunity.minInvestment) return null;
    return buildInvestmentCalculation(
      activeAmount,
      term,
      opportunity.illustrativeReturnRate
    );
  }, [activeAmount, term, opportunity]);

  const belowMin = activeAmount > 0 && activeAmount < opportunity.minInvestment;

  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-6">
      <h3 className="font-display text-lg font-semibold text-charcoal">
        Investment Calculator
      </h3>
      <p className="mt-1 text-xs text-charcoal/50">
        Illustrative figures for prototype purposes only.
      </p>

      {/* Preset amounts */}
      <div className="mt-5">
        <p className="text-xs font-medium text-charcoal/60">Choose an amount</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset);
                setCustomAmount("");
              }}
              className={cn(
                "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                !customAmount && amount === preset
                  ? "border-emerald bg-emerald-soft text-emerald"
                  : "border-charcoal/15 text-charcoal/70 hover:border-charcoal/30"
              )}
            >
              ₦{preset.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom amount */}
      <div className="mt-4">
        <p className="text-xs font-medium text-charcoal/60">Or enter a custom amount</p>
        <Input
          type="number"
          placeholder={`Min. ₦${opportunity.minInvestment.toLocaleString()}`}
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="mt-2"
        />
        {belowMin && (
          <p className="mt-1 text-xs text-danger">
            Minimum investment is ₦{opportunity.minInvestment.toLocaleString()}
          </p>
        )}
      </div>

      {/* Term selector */}
      <div className="mt-4">
        <p className="text-xs font-medium text-charcoal/60">Term</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {INVESTMENT_CONFIG.availableTerms.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                term === t
                  ? "border-emerald bg-emerald-soft text-emerald"
                  : "border-charcoal/15 text-charcoal/70 hover:border-charcoal/30"
              )}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 space-y-2 rounded-md bg-ivory-muted p-4">
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Illustrative annual return</span>
          <span className="font-medium text-charcoal">
            {calc ? `${(calc.annualReturnRate * 100).toFixed(1)}%` : "—"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-charcoal/60">Illustrative earnings</span>
          <span className="font-medium text-emerald">
            {calc ? `₦${calc.earnings.toLocaleString()}` : "—"}
          </span>
        </div>
        <div className="flex justify-between border-t border-charcoal/10 pt-2 text-sm">
          <span className="font-semibold text-charcoal">Maturity value</span>
          <span className="font-display font-bold text-charcoal">
            {calc ? `₦${calc.maturityValue.toLocaleString()}` : "—"}
          </span>
        </div>
      </div>

      <form action={createInvestmentAction}>
        <input type="hidden" name="opportunityId" value={opportunity.id} />
        <input type="hidden" name="amount" value={activeAmount} />
        <input type="hidden" name="termMonths" value={term} />
        <Button
          type="submit"
          className="mt-5 w-full bg-emerald text-ivory hover:bg-emerald/90"
          disabled={!calc}
        >
          Invest Now
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-charcoal/40">
        Illustrative figures for prototype purposes only. Not a guarantee of
        returns.
      </p>
    </div>
  );
}
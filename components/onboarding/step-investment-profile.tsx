"use client";

import { InvestorApplicationData } from "@/lib/types/investor-application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const RISK_OPTIONS = [
  {
    value: "conservative" as const,
    title: "Conservative",
    description: "Lower risk, steadier illustrative returns.",
  },
  {
    value: "balanced" as const,
    title: "Balanced",
    description: "A mix of stability and growth.",
  },
  {
    value: "growth" as const,
    title: "Growth",
    description: "Higher risk, higher illustrative returns.",
  },
];

const GOAL_OPTIONS = [
  "Grow savings",
  "Passive income",
  "Retirement planning",
  "Diversify portfolio",
];

interface StepProps {
  data: InvestorApplicationData;
  onChange: (patch: Partial<InvestorApplicationData>) => void;
}

export function StepInvestmentProfile({ data, onChange }: StepProps) {
  function toggleGoal(goal: string) {
    const next = data.goals.includes(goal)
      ? data.goals.filter((g) => g !== goal)
      : [...data.goals, goal];
    onChange({ goals: next });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label>Risk tolerance</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {RISK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ riskTolerance: opt.value })}
              className={cn(
                "text-left rounded-lg border p-4 transition-colors",
                data.riskTolerance === opt.value
                  ? "border-emerald bg-emerald-soft"
                  : "border-charcoal/10 hover:border-charcoal/20"
              )}
            >
              <p className="font-medium text-sm text-charcoal">
                {opt.title}
              </p>
              <p className="text-xs text-charcoal/50 mt-1">
                {opt.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyBudget">Monthly investment budget (₦)</Label>
        <Input
          id="monthlyBudget"
          type="number"
          min={0}
          value={data.monthlyBudget || ""}
          onChange={(e) =>
            onChange({ monthlyBudget: Number(e.target.value) })
          }
          placeholder="e.g. 500000"
        />
      </div>

      <div className="space-y-3">
        <Label>Investment goals</Label>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                data.goals.includes(goal)
                  ? "border-emerald bg-emerald-soft text-charcoal"
                  : "border-charcoal/10 text-charcoal/60 hover:border-charcoal/20"
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
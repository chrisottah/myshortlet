"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/format";
import { withdrawInvestmentAction } from "@/lib/investments/actions";
import type { Investment, InvestmentStatus } from "@/lib/types";

interface InvestmentWithTitle extends Investment {
  opportunityTitle: string;
}

const STATUS_LABELS: Record<InvestmentStatus, string> = {
  pending: "Pending",
  active: "Active",
  approaching_maturity: "Approaching Maturity",
  matured: "Matured",
  withdrawn: "Withdrawn",
  reinvested: "Reinvested",
  cancelled: "Cancelled",
};

const STATUS_FILTERS: Array<{ value: InvestmentStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "approaching_maturity", label: "Approaching Maturity" },
  { value: "matured", label: "Matured" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "reinvested", label: "Reinvested" },
  { value: "cancelled", label: "Cancelled" },
];

export function InvestmentsClient({
  investments,
}: {
  investments: InvestmentWithTitle[];
}) {
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");

  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | "all">("all");
  const [termFilter, setTermFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const availableTerms = Array.from(
    new Set(investments.map((i) => i.termMonths))
  ).sort((a, b) => a - b);

  const filtered = investments.filter((inv) => {
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (termFilter !== "all" && inv.termMonths !== Number(termFilter)) return false;
    return true;
  });

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalEarnings = investments.reduce((sum, i) => sum + i.earnings, 0);
  const maturedCount = investments.filter((i) => i.status === "matured").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          Investments
        </h1>
        <p className="text-sm text-charcoal/60">
          All figures shown are illustrative and for demo purposes only.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald/30 bg-emerald/10 px-4 py-3 text-sm text-emerald">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-charcoal/10 bg-white p-4">
          <p className="text-xs text-charcoal/50">Total Invested</p>
          <p className="text-xl font-semibold text-charcoal">
            {formatCurrency(totalInvested)}
          </p>
        </div>
        <div className="rounded-xl border border-charcoal/10 bg-white p-4">
          <p className="text-xs text-charcoal/50">Total Earnings (Illustrative)</p>
          <p className="text-xl font-semibold text-emerald">
            {formatCurrency(totalEarnings)}
          </p>
        </div>
        <div className="rounded-xl border border-charcoal/10 bg-white p-4">
          <p className="text-xs text-charcoal/50">Matured Investments</p>
          <p className="text-xl font-semibold text-charcoal">{maturedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvestmentStatus | "all")}
          className="rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm"
        >
          {STATUS_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={termFilter}
          onChange={(e) => setTermFilter(e.target.value)}
          className="rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm"
        >
          <option value="all">All terms</option>
          {availableTerms.map((term) => (
            <option key={term} value={term}>
              {term} months
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-charcoal/50 py-8 text-center">
            No investments match these filters.
          </p>
        )}

        {filtered.map((inv) => {
          const isExpanded = expandedId === inv.id;
          return (
            <div
              key={inv.id}
              className="rounded-xl border border-charcoal/10 bg-white overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="font-medium text-charcoal">{inv.opportunityTitle}</p>
                  <p className="text-xs text-charcoal/50">
                    {formatCurrency(inv.amount)} · {inv.termMonths} months ·{" "}
                    {STATUS_LABELS[inv.status]}
                  </p>
                </div>
                <span className="text-charcoal/40 text-sm">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-charcoal/10 px-4 py-4 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-charcoal/50">Invested</p>
                      <p className="text-charcoal font-medium">
                        {formatDate(inv.investedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-charcoal/50">Maturity Date</p>
                      <p className="text-charcoal font-medium">
                        {formatDate(inv.maturityDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-charcoal/50">Illustrative Earnings</p>
                      <p className="text-emerald font-medium">
                        {formatCurrency(inv.earnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-charcoal/50">Maturity Value</p>
                      <p className="text-charcoal font-medium">
                        {formatCurrency(inv.maturityValue)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Link
                      href={`/opportunities/${inv.opportunityId}`}
                      className="text-xs px-3 py-2 rounded-lg border border-charcoal/15 hover:bg-charcoal/5"
                    >
                      View Opportunity
                    </Link>

                    {inv.status === "matured" && (
                      <>
                        <form action={withdrawInvestmentAction}>
                          <input type="hidden" name="investmentId" value={inv.id} />
                          <button
                            type="submit"
                            className="text-xs px-3 py-2 rounded-lg bg-emerald text-white hover:bg-emerald/90"
                          >
                            Withdraw
                          </button>
                        </form>
                        <Link
                          href="/opportunities"
                          className="text-xs px-3 py-2 rounded-lg border border-charcoal/15 hover:bg-charcoal/5"
                        >
                          Reinvest (browse opportunities)
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
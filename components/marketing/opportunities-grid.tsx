// components/marketing/opportunities-grid.tsx
"use client";

import { useMemo, useState } from "react";
import { InvestmentOpportunity, OpportunityStatus } from "@/lib/types";
import { OpportunityCard } from "./opportunity-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INVESTMENT_CONFIG, getTierForMinInvestment, type TierId } from "@/lib/config/investment";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "amount_asc" | "amount_desc";

const STATUS_OPTIONS: { label: string; value: OpportunityStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "Almost Funded", value: "almost_funded" },
  { label: "Funded", value: "funded" },
  { label: "Upcoming", value: "upcoming" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Min. Investment: Low to High", value: "amount_asc" },
  { label: "Min. Investment: High to Low", value: "amount_desc" },
];

export function OpportunitiesGrid({
  opportunities,
  coverImages = {},
}: {
  opportunities: InvestmentOpportunity[];
  coverImages?: Record<string, string>;
}) {
  const [tab, setTab] = useState<TierId | "all">("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let results = [...opportunities];

    if (status !== "all") {
      results = results.filter((o) => o.status === status);
    }
    if (tab !== "all") {
      results = results.filter((o) => getTierForMinInvestment(o.minInvestment).id === tab);
    }

    switch (sort) {
      case "amount_asc":
        results.sort((a, b) => a.minInvestment - b.minInvestment);
        break;
      case "amount_desc":
        results.sort((a, b) => b.minInvestment - a.minInvestment);
        break;
      case "newest":
      default:
        results.sort(
          (a, b) => new Date(b.openDate).getTime() - new Date(a.openDate).getTime()
        );
    }

    return results;
  }, [opportunities, tab, status, sort]);

  const resetFilters = () => {
    setTab("all");
    setStatus("all");
    setSort("newest");
  };

  const tierCount = (id: TierId) =>
    opportunities.filter((o) => getTierForMinInvestment(o.minInvestment).id === id).length;

  return (
    <div className="mt-8">
      {/* Tier tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={cn(
            "cursor-pointer rounded-card border px-4 py-3 text-left transition-colors",
            tab === "all"
              ? "border-emerald bg-emerald-soft"
              : "border-charcoal/15 bg-white hover:border-charcoal/30"
          )}
        >
          <p className="text-sm font-semibold text-charcoal">All</p>
          <p className="text-xs text-charcoal/50">{opportunities.length} opportunities</p>
        </button>
        {INVESTMENT_CONFIG.tiers.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "cursor-pointer rounded-card border px-4 py-3 text-left transition-colors",
              tab === t.id
                ? "border-emerald bg-emerald-soft"
                : "border-charcoal/15 bg-white hover:border-charcoal/30"
            )}
          >
            <p className="text-sm font-semibold text-charcoal">{t.name}</p>
            <p className="text-xs text-charcoal/50">
              From ₦{t.minInvestment.toLocaleString()} · {tierCount(t.id)}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-charcoal/10 bg-ivory-muted p-4">
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort((v ?? "newest") as SortOption)}>
          <SelectTrigger className="w-55 bg-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(tab !== "all" || status !== "all" || sort !== "newest") && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        )}

        <span className="ml-auto text-sm text-charcoal/50">
          {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-14 flex flex-col items-center justify-center rounded-card border border-dashed border-charcoal/20 py-16 text-center">
          <p className="font-display text-lg font-semibold text-charcoal">
            No opportunities match your filters
          </p>
          <p className="mt-1 text-sm text-charcoal/50">
            Try adjusting or resetting your filters.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : tab === "all" ? (
        <div className="mt-8 space-y-12">
          {INVESTMENT_CONFIG.tiers.map((t) => {
            const items = filtered.filter(
              (o) => getTierForMinInvestment(o.minInvestment).id === t.id
            );
            if (items.length === 0) return null;
            return (
              <section key={t.id}>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-charcoal">{t.name}</h2>
                    <p className="text-sm text-charcoal/60">{t.tagline}</p>
                  </div>
                  <p className="text-sm font-medium text-charcoal/60">
                    From ₦{t.minInvestment.toLocaleString()}
                  </p>
                </div>
                <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      coverImage={coverImages[opp.id]}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} coverImage={coverImages[opp.id]} />
          ))}
        </div>
      )}
    </div>
  );
}
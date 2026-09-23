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

type SortOption = "newest" | "term_asc" | "term_desc" | "amount_asc" | "amount_desc";

const STATUS_OPTIONS: { label: string; value: OpportunityStatus | "all" }[] = [
  { label: "All Statuses", value: "all" },
  { label: "Open", value: "open" },
  { label: "Almost Funded", value: "almost_funded" },
  { label: "Funded", value: "funded" },
  { label: "Upcoming", value: "upcoming" },
];

const TERM_OPTIONS = [
  { label: "Any Term", value: "all" },
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
  { label: "12 months", value: "12" },
  { label: "18 months", value: "18" },
  { label: "24 months", value: "24" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest", value: "newest" },
  { label: "Term: Short to Long", value: "term_asc" },
  { label: "Term: Long to Short", value: "term_desc" },
  { label: "Min. Investment: Low to High", value: "amount_asc" },
  { label: "Min. Investment: High to Low", value: "amount_desc" },
];

export function OpportunitiesGrid({
  opportunities,
}: {
  opportunities: InvestmentOpportunity[];
}) {
  const [status, setStatus] = useState<string>("all");
  const [term, setTerm] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(() => {
    let results = [...opportunities];

    if (status !== "all") {
      results = results.filter((o) => o.status === status);
    }
    if (term !== "all") {
      results = results.filter((o) => o.termMonths === Number(term));
    }

    switch (sort) {
      case "term_asc":
        results.sort((a, b) => a.termMonths - b.termMonths);
        break;
      case "term_desc":
        results.sort((a, b) => b.termMonths - a.termMonths);
        break;
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
  }, [opportunities, status, term, sort]);

  const resetFilters = () => {
    setStatus("all");
    setTerm("all");
    setSort("newest");
  };

  return (
    <div className="mt-8">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-charcoal/10 bg-ivory-muted p-4">
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

        <Select value={term} onValueChange={(v) => setTerm(v ?? "all")}>
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="Term" />
          </SelectTrigger>
          <SelectContent>
            {TERM_OPTIONS.map((opt) => (
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

        {(status !== "all" || term !== "all" || sort !== "newest") && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        )}

        <span className="ml-auto text-sm text-charcoal/50">
          {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : (
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
      )}
    </div>
  );
}
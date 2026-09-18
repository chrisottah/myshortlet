"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Property, InvestmentOpportunity, PropertyStatus } from "@/lib/types";

const FILTERS: { label: string; value: PropertyStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Under Review", value: "under_review" },
  { label: "Changes Requested", value: "changes_requested" },
  { label: "Approved", value: "approved" },
  { label: "Live", value: "live" },
  { label: "Rejected", value: "rejected" },
];

const STATUS_STYLES: Record<PropertyStatus, string> = {
  draft: "bg-charcoal/10 text-charcoal/60",
  submitted: "bg-champagne/20 text-champagne-dark",
  under_review: "bg-champagne/20 text-champagne-dark",
  changes_requested: "bg-amber-100 text-amber-700",
  approved: "bg-emerald/10 text-emerald",
  rejected: "bg-red-100 text-red-700",
  live: "bg-emerald/15 text-emerald font-medium",
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
  live: "Live",
};

export function PropertiesListClient({
  items,
}: {
  items: { property: Property; opportunity: InvestmentOpportunity | null }[];
}) {
  const [filter, setFilter] = useState<PropertyStatus | "all">("all");

  const filtered =
    filter === "all" ? items : items.filter((i) => i.property.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-charcoal">My Properties</h1>
        <Link
          href="/partner/apply"
          className="rounded-card bg-emerald text-white px-4 py-2 text-sm font-medium"
        >
          Submit New Property
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.value
                ? "bg-charcoal text-white border-charcoal"
                : "border-charcoal/20 text-charcoal/60 hover:bg-charcoal/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-charcoal/60 text-sm py-10 text-center">
          No properties match this filter.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ property, opportunity }) => (
            <Link
              key={property.id}
              href={`/partner/dashboard/properties/${property.id}`}
              className="block rounded-card border border-charcoal/10 bg-white p-5 hover:border-charcoal/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-charcoal">{property.title}</p>
                  <p className="text-sm text-charcoal/50">
                    {property.location.regionId} · {property.bedrooms} bed · {property.bathrooms} bath
                  </p>
                  <p className="text-xs text-charcoal/40 mt-1">
                    Updated {formatDate(property.updatedAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-xs px-2 py-1 rounded-full ${STATUS_STYLES[property.status]}`}
                >
                  {STATUS_LABELS[property.status]}
                </span>
              </div>

              {opportunity && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-charcoal/60 mb-1">
                    <span>{formatCurrency(opportunity.amountRaised)} raised</span>
                    <span>Target {formatCurrency(opportunity.targetAmount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-charcoal/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald"
                      style={{
                        width: `${Math.min(
                          100,
                          (opportunity.amountRaised / opportunity.targetAmount) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {property.status === "changes_requested" && property.reviewNotes?.length ? (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-card px-3 py-2">
                  {property.reviewNotes[property.reviewNotes.length - 1].note}
                </p>
              ) : null}

              {property.status === "rejected" && property.reviewNotes?.length ? (
                <p className="mt-3 text-xs text-red-700 bg-red-50 rounded-card px-3 py-2">
                  {property.reviewNotes[property.reviewNotes.length - 1].note}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
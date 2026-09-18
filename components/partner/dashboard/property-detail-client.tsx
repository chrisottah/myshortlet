"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { resubmitProperty } from "@/lib/properties/actions";
import type { Property, InvestmentOpportunity } from "@/lib/types";

function Banner() {
  const params = useSearchParams();
  const error = params.get("error");
  const success = params.get("success");
  if (!error && !success) return null;
  return (
    <div
      className={`rounded-card px-4 py-3 text-sm flex items-center gap-2 ${
        error ? "bg-red-50 text-red-700" : "bg-emerald/10 text-emerald"
      }`}
    >
      {error ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
      {error ?? success}
    </div>
  );
}

export function PropertyDetailClient({
  property,
  opportunity,
}: {
  property: Property;
  opportunity: InvestmentOpportunity | null;
}) {
  const [editing, setEditing] = useState(false);
  const canResubmit = property.status === "changes_requested";

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/partner/dashboard/properties"
        className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft size={16} /> Back to properties
      </Link>

      <Suspense fallback={null}>
        <Banner />
      </Suspense>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-charcoal">{property.title}</h1>
          <p className="text-charcoal/50 text-sm mt-1">
            {property.location.regionId}, {property.location.countryId}
          </p>
        </div>
        {canResubmit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-card bg-emerald text-white px-4 py-2 text-sm font-medium"
          >
            Edit &amp; Resubmit
          </button>
        )}
      </div>

      {opportunity && (
        <div className="rounded-card border border-charcoal/10 bg-white p-5">
          <div className="flex justify-between text-sm text-charcoal/60 mb-2">
            <span>{formatCurrency(opportunity.amountRaised)} raised</span>
            <span>Target {formatCurrency(opportunity.targetAmount)}</span>
          </div>
          <div className="h-2 rounded-full bg-charcoal/10 overflow-hidden">
            <div
              className="h-full bg-emerald"
              style={{
                width: `${Math.min(100, (opportunity.amountRaised / opportunity.targetAmount) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {property.reviewNotes && property.reviewNotes.length > 0 && (
        <div className="rounded-card border border-charcoal/10 bg-white p-5">
          <h2 className="font-display text-lg text-charcoal mb-3">Review History</h2>
          <div className="space-y-3">
            {property.reviewNotes
              .slice()
              .reverse()
              .map((note, i) => (
                <div key={i} className="text-sm border-l-2 border-charcoal/10 pl-3">
                  <p className="text-charcoal/80">{note.note}</p>
                  <p className="text-charcoal/40 text-xs mt-1">{formatDate(note.at)}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {editing ? (
        <form
          action={resubmitProperty.bind(null, property.id)}
          className="rounded-card border border-charcoal/10 bg-white p-5 space-y-4"
        >
          <div>
            <label className="text-sm font-medium text-charcoal">Title</label>
            <input
              name="title"
              defaultValue={property.title}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Description</label>
            <textarea
              name="description"
              defaultValue={property.description}
              rows={4}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-charcoal">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                defaultValue={property.bedrooms}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                defaultValue={property.bathrooms}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Max Guests</label>
              <input
                type="number"
                name="maxGuests"
                defaultValue={property.maxGuests}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-charcoal">Acquisition Cost</label>
              <input
                type="number"
                name="acquisitionCost"
                defaultValue={property.financials.acquisitionCost}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Est. Annual Revenue</label>
              <input
                type="number"
                name="estimatedAnnualRevenue"
                defaultValue={property.financials.estimatedAnnualRevenue}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Occupancy Rate (0-1)</label>
              <input
                type="number"
                step="0.01"
                name="occupancyRateEstimate"
                defaultValue={property.financials.occupancyRateEstimate}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Operating Cost Est.</label>
              <input
                type="number"
                name="operatingCostEstimate"
                defaultValue={property.financials.operatingCostEstimate}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-card bg-emerald text-white px-4 py-2 text-sm font-medium"
            >
              Resubmit for Review
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-card border border-charcoal/20 text-charcoal/70 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-card border border-charcoal/10 bg-white p-5 space-y-4">
          <p className="text-charcoal/80 text-sm">{property.description}</p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><p className="text-charcoal/50">Bedrooms</p><p className="text-charcoal font-medium">{property.bedrooms}</p></div>
            <div><p className="text-charcoal/50">Bathrooms</p><p className="text-charcoal font-medium">{property.bathrooms}</p></div>
            <div><p className="text-charcoal/50">Max Guests</p><p className="text-charcoal font-medium">{property.maxGuests}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-charcoal/50">Acquisition Cost</p><p className="text-charcoal font-medium">{formatCurrency(property.financials.acquisitionCost)}</p></div>
            <div><p className="text-charcoal/50">Est. Annual Revenue</p><p className="text-charcoal font-medium">{formatCurrency(property.financials.estimatedAnnualRevenue)}</p></div>
            <div><p className="text-charcoal/50">Occupancy Rate</p><p className="text-charcoal font-medium">{Math.round(property.financials.occupancyRateEstimate * 100)}%</p></div>
            <div><p className="text-charcoal/50">Operating Cost Est.</p><p className="text-charcoal font-medium">{formatCurrency(property.financials.operatingCostEstimate)}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { approveProperty, requestChanges, rejectProperty } from "@/lib/admin/actions";
import type { Property } from "@/lib/types";

function Banner() {
  const params = useSearchParams();
  const error = params.get("error");
  const success = params.get("success");
  if (!error && !success) return null;
  return (
    <div
      className={`rounded-card px-4 py-3 text-sm flex items-center gap-2 mb-6 ${
        error ? "bg-red-50 text-red-700" : "bg-emerald/10 text-emerald"
      }`}
    >
      {error ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
      {error ?? success}
    </div>
  );
}

type ActionMode = null | "approve" | "changes" | "reject";

export function AdminPropertyReviewClient({ property }: { property: Property }) {
  const [mode, setMode] = useState<ActionMode>(null);

  const actionConfig = {
    approve: { action: approveProperty, label: "Approve Property", cta: "Confirm Approval", required: false },
    changes: { action: requestChanges, label: "Request Changes", cta: "Send Request", required: true },
    reject: { action: rejectProperty, label: "Reject Property", cta: "Confirm Rejection", required: true },
  } as const;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/admin/properties"
        className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft size={16} /> Back to queue
      </Link>

      <Suspense fallback={null}>
        <Banner />
      </Suspense>

      <div>
        <h1 className="font-display text-2xl text-charcoal">{property.title}</h1>
        <p className="text-charcoal/50 text-sm mt-1">
          {property.location.regionId}, {property.location.countryId} · Submitted {formatDate(property.createdAt)}
        </p>
      </div>

      <div className="rounded-card border border-charcoal/10 bg-white p-6 space-y-4">
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
        {property.amenities.length > 0 && (
          <div>
            <p className="text-charcoal/50 text-sm mb-2">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <span key={a} className="text-xs bg-charcoal/5 text-charcoal/70 px-2 py-1 rounded-full">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {property.reviewNotes && property.reviewNotes.length > 0 && (
        <div className="rounded-card border border-charcoal/10 bg-white p-6">
          <h2 className="font-display text-lg text-charcoal mb-3">Review History</h2>
          <div className="space-y-3">
            {property.reviewNotes.slice().reverse().map((note, i) => (
              <div key={i} className="text-sm border-l-2 border-charcoal/10 pl-3">
                <p className="text-charcoal/80">{note.note}</p>
                <p className="text-charcoal/40 text-xs mt-1">{formatDate(note.at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === null ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setMode("approve")}
            className="rounded-card bg-emerald text-white px-4 py-2 text-sm font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => setMode("changes")}
            className="rounded-card bg-amber-500 text-white px-4 py-2 text-sm font-medium"
          >
            Request Changes
          </button>
          <button
            onClick={() => setMode("reject")}
            className="rounded-card bg-red-600 text-white px-4 py-2 text-sm font-medium"
          >
            Reject
          </button>
        </div>
      ) : (
        <form
          action={actionConfig[mode].action.bind(null, property.id)}
          className="rounded-card border border-charcoal/10 bg-white p-6 space-y-4"
        >
          <h2 className="font-display text-lg text-charcoal">{actionConfig[mode].label}</h2>
          <div>
            <label className="text-sm font-medium text-charcoal">
              Note {actionConfig[mode].required ? "(required)" : "(optional)"}
            </label>
            <textarea
              name="note"
              rows={3}
              required={actionConfig[mode].required}
              placeholder={
                mode === "approve"
                  ? "Any internal notes about this approval..."
                  : "Explain what needs to change or why this was rejected..."
              }
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className={`rounded-card px-4 py-2 text-sm font-medium text-white ${
                mode === "approve" ? "bg-emerald" : mode === "changes" ? "bg-amber-500" : "bg-red-600"
              }`}
            >
              {actionConfig[mode].cta}
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="rounded-card border border-charcoal/20 text-charcoal/70 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
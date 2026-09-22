"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { createOpportunityForProperty } from "@/lib/admin/actions";
import type { Property } from "@/lib/types";

function Banner() {
  const params = useSearchParams();
  const error = params.get("error");
  if (!error) return null;
  return (
    <div className="rounded-card px-4 py-3 text-sm flex items-center gap-2 mb-6 bg-red-50 text-red-700">
      <XCircle size={16} />
      {error}
    </div>
  );
}

export function CreateOpportunityClient({ property }: { property: Property }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/admin/properties"
        className="inline-flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal"
      >
        <ArrowLeft size={16} /> Back to queue
      </Link>

      <div>
        <h1 className="font-display text-2xl text-charcoal">List as Opportunity</h1>
        <p className="text-charcoal/60 text-sm mt-1">
          Setting investment terms for <span className="font-medium text-charcoal">{property.title}</span>
        </p>
        <p className="text-xs text-charcoal/40 mt-1">
          Owner&apos;s projected acquisition cost was {formatCurrency(property.financials.acquisitionCost)} — use this as a guide for the target amount.
        </p>
      </div>

      <Suspense fallback={null}>
        <Banner />
      </Suspense>

      <form
        action={createOpportunityForProperty.bind(null, property.id)}
        className="rounded-card border border-charcoal/10 bg-white p-6 space-y-4"
      >
        <div>
          <label className="text-sm font-medium text-charcoal">Opportunity Title</label>
          <input
            name="title"
            defaultValue={property.title}
            className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-charcoal">Summary</label>
          <textarea
            name="summary"
            rows={3}
            defaultValue={property.description}
            className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-charcoal">Min Investment</label>
            <input
              type="number"
              name="minInvestment"
              defaultValue={50000}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Max Investment (optional)</label>
            <input
              type="number"
              name="maxInvestment"
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Target Amount</label>
            <input
              type="number"
              name="targetAmount"
              defaultValue={property.financials.acquisitionCost}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Term (months)</label>
            <input
              type="number"
              name="termMonths"
              defaultValue={12}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Illustrative Annual Return (%)</label>
            <input
              type="number"
              step="0.1"
              name="illustrativeReturnRate"
              defaultValue={18}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div />
          <div>
            <label className="text-sm font-medium text-charcoal">Open Date</label>
            <input
              type="date"
              name="openDate"
              defaultValue={today}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Close Date</label>
            <input
              type="date"
              name="closeDate"
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-card bg-emerald text-white px-5 py-2.5 text-sm font-medium"
        >
          List Opportunity
        </button>
      </form>
    </div>
  );
}
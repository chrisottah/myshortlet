"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { startReview } from "@/lib/admin/actions";
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

function PropertyRow({ property }: { property: Property }) {
  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-5 flex items-center justify-between">
      <div>
        <p className="font-medium text-charcoal">{property.title}</p>
        <p className="text-sm text-charcoal/50">
          {property.location.regionId} · Submitted {formatDate(property.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            property.status === "under_review"
              ? "bg-champagne/20 text-champagne-dark"
              : "bg-charcoal/10 text-charcoal/60"
          }`}
        >
          {property.status === "under_review" ? "Under Review" : "Submitted"}
        </span>
        {property.status === "submitted" ? (
          <form action={startReview.bind(null, property.id)}>
            <button
              type="submit"
              className="rounded-card bg-charcoal text-white px-3 py-1.5 text-xs font-medium"
            >
              Start Review
            </button>
          </form>
        ) : (
          <Link
            href={`/admin/properties/${property.id}`}
            className="rounded-card bg-emerald text-white px-3 py-1.5 text-xs font-medium"
          >
            Continue Review
          </Link>
        )}
      </div>
    </div>
  );
}

export function AdminPropertiesQueueClient({
  pending,
  approved,
}: {
  pending: Property[];
  approved: Property[];
}) {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl text-charcoal">Property Review</h1>
        <p className="text-charcoal/60 text-sm mt-1">
          {pending.length} propert{pending.length === 1 ? "y" : "ies"} awaiting review.
        </p>
      </div>

      <Suspense fallback={null}>
        <Banner />
      </Suspense>

      {pending.length === 0 ? (
        <div className="rounded-card border border-charcoal/10 bg-white p-10 text-center">
          <Clock className="mx-auto text-charcoal/30 mb-3" size={28} />
          <p className="text-charcoal/60 text-sm">No properties waiting on review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((p) => (
            <PropertyRow key={p.id} property={p} />
          ))}
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h2 className="font-display text-lg text-charcoal mb-3">
            Approved — Ready to List
          </h2>
          <div className="space-y-3">
            {approved.map((p) => (
              <div
                key={p.id}
                className="rounded-card border border-emerald/20 bg-emerald/5 p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-charcoal">{p.title}</p>
                  <p className="text-sm text-charcoal/50">
                    {p.location.regionId}
                  </p>
                </div>
                <Link
                  href={`/admin/properties/${p.id}/list`}
                  className="rounded-card bg-emerald text-white px-3 py-1.5 text-xs font-medium"
                >
                  List as Opportunity
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
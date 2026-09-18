"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { updatePartnerProfile } from "@/lib/partner/actions";
import type { PropertyOwner } from "@/lib/types";

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

export function PartnerSettingsClient({ user }: { user: PropertyOwner }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-charcoal">Settings</h1>
        <p className="text-charcoal/60 text-sm mt-1">
          Update your profile and payout details.
        </p>
      </div>

      <Suspense fallback={null}>
        <Banner />
      </Suspense>

      <form action={updatePartnerProfile} className="space-y-8">
        <div className="rounded-card border border-charcoal/10 bg-white p-6 space-y-4">
          <h2 className="font-display text-lg text-charcoal">Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-charcoal">First Name</label>
              <input
                name="firstName"
                defaultValue={user.firstName}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Last Name</label>
              <input
                name="lastName"
                defaultValue={user.lastName}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Email</label>
            <input
              value={user.email}
              disabled
              className="mt-1 w-full rounded-card border border-charcoal/10 bg-charcoal/5 px-3 py-2 text-sm text-charcoal/50"
            />
            <p className="text-xs text-charcoal/40 mt-1">Email cannot be changed in this demo.</p>
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Phone</label>
            <input
              name="phone"
              defaultValue={user.phone ?? ""}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal">Company Name</label>
            <input
              name="companyName"
              defaultValue={user.companyName ?? ""}
              placeholder="Optional"
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-card border border-charcoal/10 bg-white p-6 space-y-4">
          <h2 className="font-display text-lg text-charcoal">Payout Bank Details</h2>
          <p className="text-xs text-charcoal/50">
            Simulated for this demo — no real funds move.
          </p>
          <div>
            <label className="text-sm font-medium text-charcoal">Bank Name</label>
            <input
              name="bankName"
              defaultValue={user.bankDetails?.bankName ?? ""}
              className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-charcoal">Account Number</label>
              <input
                name="accountNumber"
                defaultValue={user.bankDetails?.accountNumber ?? ""}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-charcoal">Account Name</label>
              <input
                name="accountName"
                defaultValue={user.bankDetails?.accountName ?? ""}
                className="mt-1 w-full rounded-card border border-charcoal/20 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-card bg-emerald text-white px-5 py-2.5 text-sm font-medium"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
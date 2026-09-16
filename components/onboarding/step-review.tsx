"use client";

import { InvestorApplicationData } from "@/lib/types/investor-application";

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-charcoal/10 last:border-0">
      <span className="text-sm text-charcoal/50">{label}</span>
      <span className="text-sm text-charcoal font-medium text-right">
        {value}
      </span>
    </div>
  );
}

export function StepReview({ data }: { data: InvestorApplicationData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg text-charcoal mb-2">
          Personal Info
        </h3>
        <Row label="Name" value={`${data.firstName} ${data.lastName}`} />
        <Row label="Email" value={data.email} />
        <Row label="Phone" value={data.phone} />
      </div>

      <div>
        <h3 className="font-display text-lg text-charcoal mb-2">
          Investment Profile
        </h3>
        <Row label="Risk tolerance" value={data.riskTolerance} />
        <Row
          label="Monthly budget"
          value={`₦${data.monthlyBudget.toLocaleString()}`}
        />
        <Row label="Goals" value={data.goals.join(", ") || "None"} />
      </div>

      <div>
        <h3 className="font-display text-lg text-charcoal mb-2">
          Bank / Withdrawal
        </h3>
        <Row label="Bank" value={data.bankName} />
        <Row label="Account number" value={data.accountNumber} />
        <Row label="Account name" value={data.accountName} />
        {data.cryptoAsset && (
          <Row
            label="Crypto"
            value={`${data.cryptoAsset} (${data.cryptoNetwork || "network not set"})`}
          />
        )}
      </div>

      <p className="text-xs text-charcoal/50 pt-2">
        This is a demo registration — no real account is created outside this
        prototype&apos;s in-memory data.
      </p>
    </div>
  );
}
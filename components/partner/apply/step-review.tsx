"use client";

import { PropertyApplicationData } from "@/lib/types/property-application";

interface StepReviewProps {
  data: PropertyApplicationData;
}

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

export function StepReview({ data }: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg text-charcoal mb-2">
          Basic Info
        </h3>
        <Row label="Title" value={data.title} />
        <Row label="Type" value={data.propertyType} />
        <Row label="Bedrooms" value={data.bedrooms} />
        <Row label="Bathrooms" value={data.bathrooms} />
      </div>

      <div>
        <h3 className="font-display text-lg text-charcoal mb-2">Location</h3>
        <Row label="Address" value={data.addressLine} />
      </div>

      <div>
        <h3 className="font-display text-lg text-charcoal mb-2">
          Amenities
        </h3>
        <p className="text-sm text-charcoal">
          {data.amenities.join(", ") || "None selected"}
        </p>
      </div>

            <div>
        <h3 className="font-display text-lg text-charcoal mb-2">
          Financials
        </h3>
        <Row
          label="Acquisition cost"
          value={`₦${data.acquisitionCost.toLocaleString()}`}
        />
        <Row
          label="Est. annual revenue"
          value={`₦${data.estimatedAnnualRevenue.toLocaleString()}`}
        />
        <Row
          label="Est. occupancy rate"
          value={`${Math.round(data.occupancyRateEstimate * 100)}%`}
        />
        <Row
          label="Est. operating cost"
          value={`₦${data.operatingCostEstimate.toLocaleString()}`}
        />
        <Row
          label="Funding requested"
          value={`₦${data.requestedFundingAmount.toLocaleString()}`}
        />
        <Row label="Term" value={`${data.expectedTermMonths} months`} />
      </div>

      <div>
        <h3 className="font-display text-lg text-charcoal mb-2">
          Documents
        </h3>
        <p className="text-sm text-charcoal">
          {data.documentNames.length} file(s) attached
        </p>
      </div>

      <p className="text-xs text-charcoal/50 pt-2">
        By submitting, your property enters our vetting queue. You&apos;ll be
        notified once it&apos;s approved and listed — or if we need more
        information.
      </p>
    </div>
  );
}
"use client";

import { PropertyApplicationData } from "@/lib/types/property-application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TERM_OPTIONS = [3, 6, 9, 12, 18, 24];

interface StepFinancialsProps {
  data: PropertyApplicationData;
  onChange: (patch: Partial<PropertyApplicationData>) => void;
}

export function StepFinancials({ data, onChange }: StepFinancialsProps) {
  const fundingExceedsValue =
    data.acquisitionCost > 0 &&
    data.requestedFundingAmount > data.acquisitionCost;

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h3 className="font-display text-base text-charcoal">
          Property financials
        </h3>

        <div className="space-y-2">
          <Label htmlFor="acquisitionCost">Acquisition cost (₦)</Label>
          <Input
            id="acquisitionCost"
            type="number"
            min={0}
            value={data.acquisitionCost || ""}
            onChange={(e) =>
              onChange({ acquisitionCost: Number(e.target.value) })
            }
            placeholder="e.g. 45000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedAnnualRevenue">
            Estimated annual revenue (₦)
          </Label>
          <Input
            id="estimatedAnnualRevenue"
            type="number"
            min={0}
            value={data.estimatedAnnualRevenue || ""}
            onChange={(e) =>
              onChange({ estimatedAnnualRevenue: Number(e.target.value) })
            }
            placeholder="e.g. 9000000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupancyRateEstimate">
            Estimated occupancy rate (%)
          </Label>
          <Input
            id="occupancyRateEstimate"
            type="number"
            min={0}
            max={100}
            value={Math.round(data.occupancyRateEstimate * 100) || ""}
            onChange={(e) =>
              onChange({
                occupancyRateEstimate: Number(e.target.value) / 100,
              })
            }
            placeholder="e.g. 70"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operatingCostEstimate">
            Estimated annual operating cost (₦)
          </Label>
          <Input
            id="operatingCostEstimate"
            type="number"
            min={0}
            value={data.operatingCostEstimate || ""}
            onChange={(e) =>
              onChange({ operatingCostEstimate: Number(e.target.value) })
            }
            placeholder="e.g. 1500000"
          />
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-charcoal/10">
        <div>
          <h3 className="font-display text-base text-charcoal">
            Funding request
          </h3>
          <p className="text-xs text-charcoal/50 mt-1">
            Used by our team to structure the investment opportunity once
            your property is approved.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestedFundingAmount">
            Funding amount requested (₦)
          </Label>
          <Input
            id="requestedFundingAmount"
            type="number"
            min={0}
            value={data.requestedFundingAmount || ""}
            onChange={(e) =>
              onChange({ requestedFundingAmount: Number(e.target.value) })
            }
            placeholder="e.g. 15000000"
          />
          {fundingExceedsValue && (
            <p className="text-sm text-red-600">
              Requested funding can&apos;t exceed the acquisition cost.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedTermMonths">Investment term</Label>
          <Select
            value={String(data.expectedTermMonths)}
            onValueChange={(v) =>
              onChange({ expectedTermMonths: Number(v ?? 6) })
            }
          >
            <SelectTrigger id="expectedTermMonths">
              <SelectValue placeholder="Select a term" />
            </SelectTrigger>
            <SelectContent>
              {TERM_OPTIONS.map((months) => (
                <SelectItem key={months} value={String(months)}>
                  {months} months
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-charcoal/50">
        Final terms are confirmed after vetting.
      </p>
    </div>
  );
}
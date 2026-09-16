"use client";

import { useMemo } from "react";
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
import { countries, regions, cities } from "@/lib/mock-data/locations";

interface StepLocationProps {
  data: PropertyApplicationData;
  onChange: (patch: Partial<PropertyApplicationData>) => void;
}

export function StepLocation({ data, onChange }: StepLocationProps) {
  const availableRegions = useMemo(
    () => regions.filter((r) => r.countryId === data.countryId),
    [data.countryId]
  );

  const availableCities = useMemo(
    () => cities.filter((c) => c.regionId === data.regionId),
    [data.regionId]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select
          value={data.countryId}
          onValueChange={(v) =>
            onChange({ countryId: v ?? "", regionId: "", cityId: "" })
          }
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region / State</Label>
        <Select
          value={data.regionId}
          onValueChange={(v) => onChange({ regionId: v ?? "", cityId: "" })}
        >
          <SelectTrigger id="region" disabled={!data.countryId}>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {availableRegions.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Select
          value={data.cityId}
          onValueChange={(v) => onChange({ cityId: v ?? "" })}
        >
          <SelectTrigger id="city" disabled={!data.regionId}>
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {availableCities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addressLine">Street address</Label>
        <Input
          id="addressLine"
          value={data.addressLine}
          onChange={(e) => onChange({ addressLine: e.target.value })}
          placeholder="e.g. 12 Admiralty Way"
        />
      </div>
    </div>
  );
}
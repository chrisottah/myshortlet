"use client";

import { PropertyApplicationData } from "@/lib/types/property-application";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const AMENITY_OPTIONS = [
  "Wi-Fi",
  "Air Conditioning",
  "Swimming Pool",
  "Generator / 24-7 Power",
  "Parking",
  "Gym",
  "Security / Gated Estate",
  "Elevator",
  "Furnished",
  "Smart TV",
  "Kitchen Appliances",
  "Balcony",
];

interface StepAmenitiesProps {
  data: PropertyApplicationData;
  onChange: (patch: Partial<PropertyApplicationData>) => void;
}

export function StepAmenities({ data, onChange }: StepAmenitiesProps) {
  function toggleAmenity(amenity: string, checked: boolean) {
    const next = checked
      ? [...data.amenities, amenity]
      : data.amenities.filter((a) => a !== amenity);
    onChange({ amenities: next });
  }

  return (
    <div className="space-y-4">
      <Label>Select all amenities that apply</Label>
      <div className="grid grid-cols-2 gap-3">
        {AMENITY_OPTIONS.map((amenity) => {
          const checked = data.amenities.includes(amenity);
          return (
            <label
              key={amenity}
              className="flex items-center gap-2 rounded-lg border border-charcoal/10 px-3 py-2 cursor-pointer hover:bg-charcoal/[0.02]"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(c) => toggleAmenity(amenity, c === true)}
              />
              <span className="text-sm text-charcoal">{amenity}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
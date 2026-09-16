"use client";

import { PropertyApplicationData } from "@/lib/types/property-application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PROPERTY_TYPES = ["apartment", "studio", "villa", "townhouse"];

interface StepBasicInfoProps {
  data: PropertyApplicationData;
  onChange: (patch: Partial<PropertyApplicationData>) => void;
}

export function StepBasicInfo({ data, onChange }: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Property title</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. 2-Bed Luxury Shortlet, Lekki Phase 1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={5}
          placeholder="Describe the property, its condition, and what makes it a good shortlet investment."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="propertyType">Property type</Label>
        {/* Base UI Select: onValueChange gives (string | null) — always guard with ?? */}
        <Select
          value={data.propertyType}
          onValueChange={(v) => onChange({ propertyType: v ?? "" })}
        >
          <SelectTrigger id="propertyType">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

            <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input
            id="bedrooms"
            type="number"
            min={0}
            value={data.bedrooms}
            onChange={(e) => onChange({ bedrooms: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input
            id="bathrooms"
            type="number"
            min={0}
            value={data.bathrooms}
            onChange={(e) => onChange({ bathrooms: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxGuests">Max guests</Label>
        <Input
          id="maxGuests"
          type="number"
          min={1}
          value={data.maxGuests}
          onChange={(e) => onChange({ maxGuests: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
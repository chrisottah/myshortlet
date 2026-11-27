// lib/properties/partner-actions.ts
"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { nairaToKobo } from "@/lib/money";
import type { PropertyType } from "@/lib/types";

const PROPERTY_TYPES: PropertyType[] = [
  "apartment",
  "villa",
  "townhouse",
  "studio",
  "penthouse",
];

export interface SubmitPropertyInput {
  title: string;
  description: string;
  propertyType: PropertyType;
  countryId: string;
  regionId: string;
  cityId: string;
  addressLine: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  // Financial fields in naira (the form's natural unit); converted to kobo here.
  acquisitionCost: number;
  estimatedAnnualRevenue: number;
  occupancyRateEstimate: number;
  operatingCostEstimate: number;
  // Offer shape from the doc (sell/lease), kept from the apply form.
  offerType: "sell" | "lease";
  askingPrice?: number;   // naira, if offerType === "sell"
  leaseTerms?: string;    // free text, if offerType === "lease"
  documentNames: string[]; // not persisted yet (B5 upload)
}

export async function submitPropertyOffer(input: SubmitPropertyInput) {
  const user = await getCurrentUser();
  if (!user || user.role !== "property_owner") {
    throw new Error("Only signed-in property owners can submit properties.");
  }

  if (!PROPERTY_TYPES.includes(input.propertyType)) {
    throw new Error("Invalid property type.");
  }
  if (!input.title.trim() || !input.description.trim()) {
    throw new Error("Title and description are required.");
  }
  if (!input.countryId || !input.regionId || !input.cityId) {
    throw new Error("Country, region and city are required.");
  }
  if (!input.addressLine.trim()) {
    throw new Error("Address line is required.");
  }

  const property = await propertyService.submitProperty({
    ownerId: user.id,
    sourceType: "owner_offer",
    title: input.title,
    description: input.description,
    type: input.propertyType,
    countryId: input.countryId,
    regionId: input.regionId,
    cityId: input.cityId,
    addressLine: input.addressLine,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    maxGuests: input.maxGuests,
    amenities: input.amenities,
    offerType: input.offerType,
    askingPriceKobo:
      input.offerType === "sell" && input.askingPrice !== undefined
        ? nairaToKobo(input.askingPrice)
        : undefined,
    leaseTerms: input.offerType === "lease" ? input.leaseTerms : undefined,
    acquisitionCostKobo: nairaToKobo(input.acquisitionCost),
    estimatedAnnualRevenueKobo: nairaToKobo(input.estimatedAnnualRevenue),
    occupancyRateEstimate: input.occupancyRateEstimate,
    operatingCostEstimateKobo: nairaToKobo(input.operatingCostEstimate),
  });

  return { propertyId: property.id };
}
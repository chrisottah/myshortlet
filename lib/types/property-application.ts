export interface PropertyApplicationData {
  // Step 1 — Basic Info
  title: string;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;

  // Step 2 — Location
  countryId: string;
  regionId: string;
  cityId: string;
  addressLine: string;

  // Step 3 — Amenities
  amenities: string[];

  // Step 4 — Financials (real Property fields)
  acquisitionCost: number;
  estimatedAnnualRevenue: number;
  occupancyRateEstimate: number; // 0-1
  operatingCostEstimate: number;

  // Step 4 — Opportunity-creation inputs (not on Property; used later in Phase 8)
  requestedFundingAmount: number;
  expectedTermMonths: number;

  // Step 5 — Documents (mock upload)
  documentNames: string[];
}

export const EMPTY_APPLICATION: PropertyApplicationData = {
  title: "",
  description: "",
  propertyType: "",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  countryId: "",
  regionId: "",
  cityId: "",
  addressLine: "",
  amenities: [],
  acquisitionCost: 0,
  estimatedAnnualRevenue: 0,
  occupancyRateEstimate: 0.7,
  operatingCostEstimate: 0,
  requestedFundingAmount: 0,
  expectedTermMonths: 6,
  documentNames: [],
};

export const APPLICATION_STEPS = [
  "Basic Info",
  "Location",
  "Amenities",
  "Financials",
  "Documents",
  "Review",
] as const;

export type ApplicationStep = (typeof APPLICATION_STEPS)[number];
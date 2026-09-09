// lib/types/property.ts

import { Location } from "./location";

export type PropertyStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected"
  | "live";

export type PropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "studio"
  | "penthouse";

export interface PropertyFinancials {
  acquisitionCost: number;
  estimatedAnnualRevenue: number;
  occupancyRateEstimate: number; // 0-1
  operatingCostEstimate: number;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: PropertyType;
  location: Location;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  financials: PropertyFinancials;
  status: PropertyStatus;
  reviewNotes?: { note: string; byAdminId: string; at: string }[];
  createdAt: string;
  updatedAt: string;
}
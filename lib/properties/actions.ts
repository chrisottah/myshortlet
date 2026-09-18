"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import type { PropertyFinancials } from "@/lib/types";

export async function resubmitProperty(propertyId: string, formData: FormData) {
  const user = await getCurrentUser();
  if (!user || user.role !== "property_owner") {
    redirect("/login");
  }

  const property = propertyService.getById(propertyId);
  if (!property || property.ownerId !== user.id) {
    redirect("/partner/dashboard/properties?error=Property%20not%20found");
  }

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const maxGuests = Number(formData.get("maxGuests"));
  const acquisitionCost = Number(formData.get("acquisitionCost"));
  const estimatedAnnualRevenue = Number(formData.get("estimatedAnnualRevenue"));
  const occupancyRateEstimate = Number(formData.get("occupancyRateEstimate"));
  const operatingCostEstimate = Number(formData.get("operatingCostEstimate"));

  if (!title || !description || [bedrooms, bathrooms, maxGuests, acquisitionCost, estimatedAnnualRevenue, occupancyRateEstimate, operatingCostEstimate].some((n) => Number.isNaN(n))) {
    redirect(`/partner/dashboard/properties/${propertyId}?error=Please%20fill%20in%20all%20fields`);
  }

  const financials: PropertyFinancials = {
    acquisitionCost,
    estimatedAnnualRevenue,
    occupancyRateEstimate,
    operatingCostEstimate,
  };

  try {
    propertyService.updateProperty(propertyId, {
      title,
      description,
      bedrooms,
      bathrooms,
      maxGuests,
      financials,
    });
    propertyService.updateStatus(propertyId, "submitted");
  } catch {
    redirect(`/partner/dashboard/properties/${propertyId}?error=Could%20not%20resubmit`);
  }

  redirect(`/partner/dashboard/properties/${propertyId}?success=Resubmitted%20for%20review`);
}
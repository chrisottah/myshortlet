import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { investmentService } from "@/lib/services/investment-service";
import { PropertiesListClient } from "@/components/partner/dashboard/properties-list-client";
import type { PropertyOwner } from "@/lib/types";

export default async function PartnerPropertiesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "property_owner") redirect("/login");
  const owner = user as PropertyOwner;

  const properties = propertyService.getByOwnerId(owner.id);
  const allOpportunities = investmentService.getOpportunities();

  const propertiesWithOpportunity = properties.map((p) => ({
    property: p,
    opportunity: allOpportunities.find((o) => o.propertyId === p.id) ?? null,
  }));

  return <PropertiesListClient items={propertiesWithOpportunity} />;
}
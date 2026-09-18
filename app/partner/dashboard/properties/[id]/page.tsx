import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { investmentService } from "@/lib/services/investment-service";
import { PropertyDetailClient } from "@/components/partner/dashboard/property-detail-client";
import type { PropertyOwner } from "@/lib/types";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "property_owner") redirect("/login");
  const owner = user as PropertyOwner;

  const property = propertyService.getById(id);
  if (!property || property.ownerId !== owner.id) notFound();

  const opportunity =
    investmentService.getOpportunities().find((o) => o.propertyId === property.id) ?? null;

  return <PropertyDetailClient property={property} opportunity={opportunity} />;
}
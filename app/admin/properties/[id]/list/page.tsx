import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { CreateOpportunityClient } from "@/components/admin/create-opportunity-client";

export default async function ListPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const property = propertyService.getById(id);
  if (!property) notFound();
  if (property.status !== "approved") {
    redirect("/admin/properties?error=Property%20must%20be%20approved%20first");
  }

  return <CreateOpportunityClient property={property} />;
}
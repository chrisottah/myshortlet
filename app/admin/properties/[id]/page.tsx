import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { AdminPropertyReviewClient } from "@/components/admin/property-review-client";

export default async function AdminPropertyReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const property = propertyService.getById(id);
  if (!property) notFound();

  return <AdminPropertyReviewClient property={property} />;
}
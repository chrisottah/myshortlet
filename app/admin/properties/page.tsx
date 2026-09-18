import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { AdminPropertiesQueueClient } from "@/components/admin/properties-queue-client";

export default async function AdminPropertiesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const properties = [
    ...propertyService.getByStatus("submitted"),
    ...propertyService.getByStatus("under_review"),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const approved = propertyService.getByStatus("approved");

  return <AdminPropertiesQueueClient pending={properties} approved={approved} />;
}
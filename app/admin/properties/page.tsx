import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { AdminPropertiesQueueClient } from "@/components/admin/properties-queue-client";

export default async function AdminPropertiesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const [submitted, underReview, approved] = await Promise.all([
    propertyService.getByStatus("submitted"),
    propertyService.getByStatus("under_review"),
    propertyService.getByStatus("approved"),
  ]);

  const properties = [...submitted, ...underReview].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return <AdminPropertiesQueueClient pending={properties} approved={approved} />;
}
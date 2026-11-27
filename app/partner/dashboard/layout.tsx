import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { PartnerDashboardShell } from "@/components/partner/dashboard/partner-dashboard-shell";
import type { PropertyOwner } from "@/lib/types";

export default async function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== "property_owner") {
    redirect("/login");
  }

  const owner = user as PropertyOwner;
  const properties = await propertyService.getByOwnerId(owner.id);

  return (
    <PartnerDashboardShell user={owner} properties={properties}>
      {children}
    </PartnerDashboardShell>
  );
}
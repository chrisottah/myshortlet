import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { PartnerSettingsClient } from "@/components/partner/dashboard/settings-client";
import type { PropertyOwner } from "@/lib/types";

export default async function PartnerSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "property_owner") redirect("/login");

  return <PartnerSettingsClient user={user as PropertyOwner} />;
}
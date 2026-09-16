import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { SettingsClient } from "@/components/dashboard/settings-client";
import type { Investor } from "@/lib/types";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const investor = user?.role === "investor" ? (user as Investor) : null;

  return (
    <Suspense fallback={null}>
      <SettingsClient investor={investor} />
    </Suspense>
  );
}
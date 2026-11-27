import { redirect } from "next/navigation";
import { getCurrentUserFull } from "@/lib/auth/session";
import { toFrontendInvestor } from "@/lib/auth/adapters";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dbUser = await getCurrentUserFull();

  if (!dbUser) {
    redirect(
      "/login?error=" + encodeURIComponent("Please log in to view your dashboard.")
    );
  }

  if (dbUser.role !== "investor") {
    redirect(
      "/login?error=" + encodeURIComponent("This dashboard is for investors only.")
    );
  }

  const user = toFrontendInvestor(dbUser);
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
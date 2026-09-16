import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=" + encodeURIComponent("Please log in to view your dashboard."));
  }

  if (user.role !== "investor") {
    redirect("/login?error=" + encodeURIComponent("This dashboard is for investors only."));
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
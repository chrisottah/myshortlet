import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminShell } from "@/components/admin/admin-shell";
import type { AdminUser } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return <AdminShell user={user as AdminUser}>{children}</AdminShell>;
}
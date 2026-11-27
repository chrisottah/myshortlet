import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { adminService } from "@/lib/services/admin-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/format";
import { Clock, Building2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const metrics = await adminService.getDashboardMetrics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-charcoal">Admin Overview</h1>
        <p className="text-charcoal/60 text-sm mt-1">Platform activity at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Properties"
          value={String(metrics.pendingPropertiesCount)}
          icon={Building2}
        />
        <StatCard
          label="Pending Deposits"
          value={String(metrics.pendingDepositsCount)}
          icon={ArrowDownCircle}
        />
        <StatCard
          label="Pending Withdrawals"
          value={String(metrics.pendingWithdrawalsCount)}
          icon={ArrowUpCircle}
        />
        <StatCard
          label="Total Transactions"
          value={String(metrics.totalTransactions)}
          icon={Clock}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-card border border-charcoal/10 bg-white p-6">
          <p className="text-sm text-charcoal/60">Total Deposit Volume</p>
          <p className="font-display text-2xl text-charcoal mt-1">
            {formatCurrency(metrics.totalDepositVolume)}
          </p>
        </div>
        <div className="rounded-card border border-charcoal/10 bg-white p-6">
          <p className="text-sm text-charcoal/60">Total Withdrawal Volume</p>
          <p className="font-display text-2xl text-charcoal mt-1">
            {formatCurrency(metrics.totalWithdrawalVolume)}
          </p>
        </div>
      </div>

      {metrics.pendingPropertiesCount > 0 && (
        <div className="rounded-card border border-champagne/40 bg-champagne/10 p-5 flex items-center justify-between">
          <p className="text-sm text-charcoal">
            {metrics.pendingPropertiesCount} propert
            {metrics.pendingPropertiesCount === 1 ? "y" : "ies"} awaiting review.
          </p>
          <Link
            href="/admin/properties"
            className="text-sm font-medium text-emerald hover:underline"
          >
            Review now →
          </Link>
        </div>
      )}
    </div>
  );
}
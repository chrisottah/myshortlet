import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { investmentService } from "@/lib/services/investment-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import type { PropertyOwner } from "@/lib/types";
import { Building2, CheckCircle2, Clock, Wallet } from "lucide-react";

export default async function PartnerOverviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "property_owner") redirect("/login");
  const owner = user as PropertyOwner;

  const properties = await propertyService.getByOwnerId(owner.id);
  const allOpportunities = await investmentService.getOpportunities();

  const pendingStatuses = new Set(["submitted", "under_review", "changes_requested"]);
  const pendingCount = properties.filter((p) => pendingStatuses.has(p.status)).length;
  const liveCount = properties.filter((p) => p.status === "live").length;
  const rejectedCount = properties.filter((p) => p.status === "rejected").length;

  const totalRaised = properties.reduce((sum, p) => {
    const opp = allOpportunities.find((o) => o.propertyId === p.id);
    return sum + (opp?.amountRaised ?? 0);
  }, 0);

  const recentProperties = [...properties]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-charcoal">
          Welcome back, {owner.firstName}
        </h1>
        <p className="text-charcoal/60 text-sm mt-1">
          Here is how your properties are performing.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Properties" value={String(properties.length)} icon={Building2} />
        <StatCard label="Pending Review" value={String(pendingCount)} icon={Clock} />
        <StatCard label="Live" value={String(liveCount)} icon={CheckCircle2} />
        <StatCard label="Total Raised" value={formatCurrency(totalRaised)} icon={Wallet} />
      </div>

      <div className="bg-ivory rounded-card border border-charcoal/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-charcoal">Recent Properties</h2>
          <Link
            href="/partner/dashboard/properties"
            className="text-sm text-emerald hover:underline"
          >
            View all
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-charcoal/60 text-sm mb-4">
              You have not submitted any properties yet.
            </p>
            <Link
              href="/partner/apply"
              className="inline-flex items-center rounded-card bg-emerald text-white px-4 py-2 text-sm font-medium"
            >
              Submit your first property
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentProperties.map((p) => {
              const opp = allOpportunities.find((o) => o.propertyId === p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-card border border-charcoal/10 px-4 py-3"
                >
                  <div>
                    <p className="text-charcoal font-medium text-sm">{p.title}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={p.status} />
                    {opp && (
                      <p className="text-xs text-charcoal/50 mt-1">
                        {formatCurrency(opp.amountRaised)} / {formatCurrency(opp.targetAmount)} raised
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {rejectedCount > 0 && (
        <p className="text-sm text-charcoal/50">
          {rejectedCount} propert{rejectedCount === 1 ? "y" : "ies"} rejected — see notes on the property detail.
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-charcoal/10 text-charcoal/60",
    submitted: "bg-champagne/20 text-champagne-dark",
    under_review: "bg-champagne/20 text-champagne-dark",
    changes_requested: "bg-amber-100 text-amber-700",
    approved: "bg-emerald/10 text-emerald",
    rejected: "bg-red-100 text-red-700",
    live: "bg-emerald/15 text-emerald font-medium",
  };
  const labels: Record<string, string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under Review",
    changes_requested: "Changes Requested",
    approved: "Approved",
    rejected: "Rejected",
    live: "Live",
  };
  return (
    <span className={`inline-block text-xs px-2 py-1 rounded-full ${styles[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}
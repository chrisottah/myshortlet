import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { adminService } from "@/lib/services/admin-service";
import { formatDate } from "@/lib/format";
import { ScrollText } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  "property.review_started": "Started reviewing property",
  "property.approved": "Approved property",
  "property.changes_requested": "Requested changes",
  "property.rejected": "Rejected property",
  "opportunity.created": "Listed opportunity",
};

export default async function AdminAuditLogPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/login");

  const logs = adminService.getAuditLogs();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl text-charcoal">Audit Log</h1>
        <p className="text-charcoal/60 text-sm mt-1">
          A record of every admin action on the platform.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-card border border-charcoal/10 bg-white p-10 text-center">
          <ScrollText className="mx-auto text-charcoal/30 mb-3" size={28} />
          <p className="text-charcoal/60 text-sm">No actions recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-card border border-charcoal/10 bg-white p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium text-charcoal">
                  {ACTION_LABELS[log.action] ?? log.action}
                </p>
                <p className="text-xs text-charcoal/50 mt-0.5">
                  {log.targetType} · {log.targetId}
                </p>
                {log.metadata && (
                  <p className="text-xs text-charcoal/40 mt-1">
                    {Object.entries(log.metadata)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <p className="text-xs text-charcoal/40 whitespace-nowrap shrink-0">
                {formatDate(log.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
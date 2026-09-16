"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction, TransactionType, TransactionStatus } from "@/lib/types";

const TYPE_LABELS: Record<TransactionType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  investment: "Investment",
  earning: "Earning",
  reinvestment: "Reinvestment",
  refund: "Refund",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<TransactionStatus, string> = {
  pending: "bg-champagne/20 text-champagne-700",
  completed: "bg-emerald/10 text-emerald",
  failed: "bg-red-50 text-red-700",
  cancelled: "bg-charcoal/10 text-charcoal/60",
};

// Types that reduce the wallet (shown with a minus sign)
const OUTFLOW_TYPES: TransactionType[] = ["investment", "withdrawal"];

const TYPE_FILTERS: Array<{ value: TransactionType | "all"; label: string }> = [
  { value: "all", label: "All types" },
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "investment", label: "Investment" },
  { value: "earning", label: "Earning" },
  { value: "reinvestment", label: "Reinvestment" },
  { value: "refund", label: "Refund" },
];

const STATUS_FILTERS: Array<{ value: TransactionStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TransactionsClient({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">("all");

  const filtered = transactions.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-charcoal">
          Transactions
        </h1>
        <p className="text-sm text-charcoal/60">
          Simulated for this demo — no real funds move.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | "all")}
          className="rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm"
        >
          {TYPE_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TransactionStatus | "all")
          }
          className="rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-sm"
        >
          {STATUS_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-charcoal/50 py-8 text-center">
            No transactions match these filters.
          </p>
        ) : (
          <div className="divide-y divide-charcoal/10">
            {filtered.map((t) => {
              const isOutflow = OUTFLOW_TYPES.includes(t.type);
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">
                      {t.description}
                    </p>
                    <p className="text-xs text-charcoal/50">
                      {TYPE_LABELS[t.type]} · {t.reference} ·{" "}
                      {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 pl-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[t.status]}`}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isOutflow ? "text-charcoal" : "text-emerald"
                      }`}
                    >
                      {isOutflow ? "−" : "+"}
                      {formatCurrency(t.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
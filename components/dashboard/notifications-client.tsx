"use client";

import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/format";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/lib/notifications/actions";
import type { Notification, NotificationType } from "@/lib/types";

const TYPE_LABELS: Record<NotificationType, string> = {
  investment_update: "Investment",
  deposit_update: "Deposit",
  withdrawal_update: "Withdrawal",
  property_update: "Property",
  system: "System",
};

const TYPE_STYLES: Record<NotificationType, string> = {
  investment_update: "bg-emerald/10 text-emerald",
  deposit_update: "bg-champagne/20 text-champagne-700",
  withdrawal_update: "bg-champagne/20 text-champagne-700",
  property_update: "bg-charcoal/10 text-charcoal/70",
  system: "bg-charcoal/10 text-charcoal/70",
};

export function NotificationsClient({
  notifications,
}: {
  notifications: Notification[];
}) {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            Notifications
          </h1>
          <p className="text-sm text-charcoal/60">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>

        {unreadCount > 0 && (
          <form action={markAllNotificationsReadAction}>
            <button
              type="submit"
              className="text-xs px-3 py-2 rounded-lg border border-charcoal/15 hover:bg-charcoal/5"
            >
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="rounded-xl border border-charcoal/10 bg-white overflow-hidden">
        {notifications.length === 0 ? (
          <p className="text-sm text-charcoal/50 py-8 text-center">
            No notifications yet.
          </p>
        ) : (
          <div className="divide-y divide-charcoal/10">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-3 px-4 py-3 ${
                  !n.read ? "bg-emerald/5" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLES[n.type]}`}
                    >
                      {TYPE_LABELS[n.type]}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-charcoal mt-1">
                    {n.title}
                  </p>
                  <p className="text-sm text-charcoal/60">{n.message}</p>
                  <p className="text-xs text-charcoal/40 mt-1">
                    {formatDate(n.createdAt)}
                  </p>
                </div>

                {!n.read && (
                  <form action={markNotificationReadAction} className="shrink-0">
                    <input type="hidden" name="notificationId" value={n.id} />
                    <button
                      type="submit"
                      className="text-xs px-2 py-1 rounded-lg border border-charcoal/15 hover:bg-charcoal/5 whitespace-nowrap"
                    >
                      Mark read
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
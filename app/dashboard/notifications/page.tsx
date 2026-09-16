import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { notificationService } from "@/lib/services/notification-service";
import { NotificationsClient } from "@/components/dashboard/notifications-client";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  const notifications = user
    ? notificationService.getByUserId(user.id)
    : [];

  return (
    <Suspense fallback={null}>
      <NotificationsClient notifications={notifications} />
    </Suspense>
  );
}
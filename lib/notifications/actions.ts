"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { notificationService } from "@/lib/services/notification-service";

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = formData.get("notificationId");
  if (!notificationId || typeof notificationId !== "string") {
    redirect("/dashboard/notifications?error=Invalid+notification");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const notification = notificationService
    .getByUserId(user.id)
    .find((n) => n.id === notificationId);

  if (!notification) {
    redirect("/dashboard/notifications?error=Notification+not+found");
  }

  notificationService.markRead(notificationId);

  redirect("/dashboard/notifications");
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  notificationService.markAllRead(user.id);

  redirect("/dashboard/notifications");
}
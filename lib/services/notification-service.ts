// lib/services/notification-service.ts

import { MockRepository, generateId } from "./mock-db";
import { Notification, NotificationType } from "@/lib/types";

const notificationRepo = new MockRepository<Notification>();

export const notificationService = {
  notify(input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
  }): Notification {
    const notification: Notification = {
      id: generateId("ntf"),
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    return notificationRepo.create(notification);
  },

  seedNotifications(items: Notification[]) {
    items.forEach((item) => notificationRepo.create(item));
  },

  getByUserId(userId: string): Notification[] {
    return notificationRepo
      .findWhere((n) => n.userId === userId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  getUnreadCount(userId: string): number {
    return notificationRepo.findWhere((n) => n.userId === userId && !n.read)
      .length;
  },

  markRead(id: string) {
    return notificationRepo.update(id, { read: true });
  },

  markAllRead(userId: string) {
    notificationRepo
      .findWhere((n) => n.userId === userId && !n.read)
      .forEach((n) => notificationRepo.update(n.id, { read: true }));
  },
};
"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { adminService } from "@/lib/services/admin-service";
import type { AdminUser } from "@/lib/types";

async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }
  return user as AdminUser;
}

export async function startReview(propertyId: string) {
  const admin = await requireAdmin();

  const property = propertyService.getById(propertyId);
  if (!property) {
    redirect("/admin/properties?error=Property%20not%20found");
  }

  if (property.status === "submitted") {
    propertyService.updateStatus(propertyId, "under_review");
    adminService.logAction({
      actorId: admin.id,
      actorRole: "admin",
      action: "property.review_started",
      targetType: "property",
      targetId: propertyId,
    });
  }

  redirect(`/admin/properties/${propertyId}`);
}

export async function approveProperty(propertyId: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();

  const property = propertyService.getById(propertyId);
  if (!property) {
    redirect("/admin/properties?error=Property%20not%20found");
  }

  propertyService.updateStatus(
    propertyId,
    "approved",
    note ? { note, byAdminId: admin.id } : undefined
  );

  adminService.logAction({
    actorId: admin.id,
    actorRole: "admin",
    action: "property.approved",
    targetType: "property",
    targetId: propertyId,
    metadata: note ? { note } : undefined,
  });

  redirect(`/admin/properties/${propertyId}?success=Property%20approved`);
}

export async function requestChanges(propertyId: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();

  if (!note) {
    redirect(`/admin/properties/${propertyId}?error=A%20note%20is%20required`);
  }

  const property = propertyService.getById(propertyId);
  if (!property) {
    redirect("/admin/properties?error=Property%20not%20found");
  }

  propertyService.updateStatus(propertyId, "changes_requested", {
    note,
    byAdminId: admin.id,
  });

  adminService.logAction({
    actorId: admin.id,
    actorRole: "admin",
    action: "property.changes_requested",
    targetType: "property",
    targetId: propertyId,
    metadata: { note },
  });

  redirect(`/admin/properties?success=Changes%20requested`);
}

export async function rejectProperty(propertyId: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();

  if (!note) {
    redirect(`/admin/properties/${propertyId}?error=A%20reason%20is%20required`);
  }

  const property = propertyService.getById(propertyId);
  if (!property) {
    redirect("/admin/properties?error=Property%20not%20found");
  }

  propertyService.updateStatus(propertyId, "rejected", {
    note,
    byAdminId: admin.id,
  });

  adminService.logAction({
    actorId: admin.id,
    actorRole: "admin",
    action: "property.rejected",
    targetType: "property",
    targetId: propertyId,
    metadata: { note },
  });

  redirect(`/admin/properties?success=Property%20rejected`);
}
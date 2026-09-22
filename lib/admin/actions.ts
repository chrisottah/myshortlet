"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { adminService } from "@/lib/services/admin-service";
import { investmentService } from "@/lib/services/investment-service";
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

export async function createOpportunityForProperty(propertyId: string, formData: FormData) {
  const admin = await requireAdmin();

  const property = propertyService.getById(propertyId);
  if (!property) {
    redirect("/admin/properties?error=Property%20not%20found");
  }
  if (property.status !== "approved") {
    redirect(`/admin/properties?error=Property%20must%20be%20approved%20first`);
  }

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const minInvestment = Number(formData.get("minInvestment"));
  const maxInvestmentRaw = formData.get("maxInvestment");
  const maxInvestment = maxInvestmentRaw ? Number(maxInvestmentRaw) : undefined;
  const targetAmount = Number(formData.get("targetAmount"));
  const termMonths = Number(formData.get("termMonths"));
  const illustrativeReturnRateRaw = Number(formData.get("illustrativeReturnRate"));
  const illustrativeReturnRate = illustrativeReturnRateRaw / 100;
  const openDate = String(formData.get("openDate") ?? "");
  const closeDate = String(formData.get("closeDate") ?? "");

  if (
    !title ||
    !summary ||
    !openDate ||
    !closeDate ||
    [minInvestment, targetAmount, termMonths, illustrativeReturnRateRaw].some((n) => Number.isNaN(n))
  ) {
    redirect(`/admin/properties/${propertyId}/list?error=Please%20fill%20in%20all%20fields`);
  }

  try {
    const opportunity = investmentService.createOpportunity({
      propertyId,
      title,
      summary,
      minInvestment,
      maxInvestment,
      targetAmount,
      termMonths,
      illustrativeReturnRate,
      openDate: new Date(openDate).toISOString(),
      closeDate: new Date(closeDate).toISOString(),
    });

    propertyService.updateStatus(propertyId, "live");

    adminService.logAction({
      actorId: admin.id,
      actorRole: "admin",
      action: "opportunity.created",
      targetType: "property",
      targetId: propertyId,
      metadata: { opportunityId: opportunity.id, targetAmount, termMonths },
    });
  } catch {
    redirect(`/admin/properties/${propertyId}/list?error=Could%20not%20create%20opportunity`);
  }

  redirect(`/admin/properties?success=Opportunity%20listed`);
}
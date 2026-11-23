"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { propertyService } from "@/lib/services/property-service";
import { adminService } from "@/lib/services/admin-service";
import { INVESTMENT_CONFIG } from "@/lib/config/investment";
import type { AdminUser, PropertyType } from "@/lib/types";

const PROPERTY_TYPES: PropertyType[] = ["apartment", "villa", "townhouse", "studio", "penthouse"];

async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login");
  }
  return user as AdminUser;
}

function parseStringList(raw: FormDataEntryValue | null): string[] | null {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    if (!Array.isArray(parsed)) return null;
    const list = parsed.map((v) => String(v).trim()).filter(Boolean);
    return Array.from(new Set(list));
  } catch {
    return null;
  }
}

const err = (path: string, message: string) => `${path}?error=${encodeURIComponent(message)}`;

export async function savePropertyContent(propertyId: string, formData: FormData) {
  const admin = await requireAdmin();
  const back = `/admin/content/${propertyId}`;

  const property = propertyService.getById(propertyId);
  if (!property) redirect(err("/admin/content", "Property not found"));

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "") as PropertyType;
  const bedrooms = Number(formData.get("bedrooms"));
  const bathrooms = Number(formData.get("bathrooms"));
  const maxGuests = Number(formData.get("maxGuests"));
  const amenities = parseStringList(formData.get("amenities"));
  const images = parseStringList(formData.get("images"));

  if (!title || !description) redirect(err(back, "Title and description are required"));
  if (!PROPERTY_TYPES.includes(type)) redirect(err(back, "Choose a valid property type"));
  if ([bedrooms, bathrooms, maxGuests].some((n) => !Number.isInteger(n) || n < 0)) {
    redirect(err(back, "Bedrooms, bathrooms and guests must be whole numbers"));
  }
  if (!amenities || !images) redirect(err(back, "Could not read the form"));

  const max = INVESTMENT_CONFIG.maxImagesPerProperty;
  if (images.length > max) redirect(err(back, `A property can have at most ${max} images`));
  if (
    images.some(
      (src) => !((src.startsWith("/") && !src.startsWith("//")) || src.startsWith("https://"))
    )
  ) {
    redirect(err(back, "Image paths must start with / or https://"));
  }

  propertyService.updateProperty(propertyId, {
    title,
    description,
    type,
    bedrooms,
    bathrooms,
    maxGuests,
    amenities,
    images,
  });

  adminService.logAction({
    actorId: admin.id,
    actorRole: "admin",
    action: "property.content_updated",
    targetType: "property",
    targetId: propertyId,
    metadata: { imageCount: images.length },
  });

  redirect(`${back}?success=${encodeURIComponent("Property content saved")}`);
}
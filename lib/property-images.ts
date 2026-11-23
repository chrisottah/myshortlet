import { INVESTMENT_CONFIG } from "@/lib/config/investment";
import { getGalleryForId } from "@/lib/mock-data/stock-images";
import type { Property } from "@/lib/types";

/** The property's own photos (max 10); falls back to the stock placeholders. */
export function getPropertyImages(property: Property | undefined, fallbackId: string): string[] {
  const own = (property?.images ?? [])
    .filter(Boolean)
    .slice(0, INVESTMENT_CONFIG.maxImagesPerProperty);
  return own.length > 0 ? own : getGalleryForId(fallbackId, 5);
}

export function getPropertyCover(property: Property | undefined, fallbackId: string): string {
  return getPropertyImages(property, fallbackId)[0];
}
// lib/services/property-service.ts
// Prisma-backed. Adapter keeps the frontend `Property` shape (flat location,
// flat financials, images: string[]) so components don't have to change.

import { prisma } from "@/lib/db";
import { koboToNaira } from "@/lib/money";
import type { Property, PropertyStatus, PropertyType } from "@/lib/types";
import type { Prisma, PropertyStatus as DbPropertyStatus } from "@prisma/client";

type DbPropertyRow = Prisma.PropertyGetPayload<{
  include: { images: true; country: true; region: true; city: true };
}>;

/** Adapt a DB row (with relations) to the frontend Property shape. */
function toFrontend(row: DbPropertyRow): Property {
  return {
    id: row.id,
    ownerId: row.ownerId ?? "",
    title: row.title,
    description: row.description,
    type: row.type as PropertyType,
    location: {
      countryId: row.countryId,
      regionId: row.regionId,
      cityId: row.cityId,
      address: row.addressLine ?? undefined,
    },
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    maxGuests: row.maxGuests,
    amenities: row.amenities,
    images: row.images
      .sort((a, b) => a.position - b.position)
      .map((i) => i.url ?? i.storageKey),
    financials: {
      acquisitionCost: row.acquisitionCostKobo
        ? koboToNaira(row.acquisitionCostKobo)
        : 0,
      estimatedAnnualRevenue: row.estimatedAnnualRevenueKobo
        ? koboToNaira(row.estimatedAnnualRevenueKobo)
        : 0,
      occupancyRateEstimate: row.occupancyRateEstimate
        ? Number(row.occupancyRateEstimate)
        : 0,
      operatingCostEstimate: row.operatingCostEstimateKobo
        ? koboToNaira(row.operatingCostEstimateKobo)
        : 0,
    },
    status: row.status as PropertyStatus,
    reviewNotes: (row.reviewNotes as Property["reviewNotes"] | null) ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const INCLUDE = {
  images: true,
  country: true,
  region: true,
  city: true,
} as const;

export const propertyService = {
  async getAll(): Promise<Property[]> {
    const rows = await prisma.property.findMany({
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toFrontend);
  },

  async getById(id: string): Promise<Property | undefined> {
    const row = await prisma.property.findUnique({
      where: { id },
      include: INCLUDE,
    });
    return row ? toFrontend(row) : undefined;
  },

  async getByOwnerId(ownerId: string): Promise<Property[]> {
    const rows = await prisma.property.findMany({
      where: { ownerId },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toFrontend);
  },

  async getByStatus(status: PropertyStatus): Promise<Property[]> {
    const rows = await prisma.property.findMany({
      where: { status: status as DbPropertyStatus },
      include: INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toFrontend);
  },

  async submitProperty(input: {
    ownerId?: string;
    sourceType?: "owner_offer" | "company_sourced";
    title: string;
    description: string;
    type: string;
    countryId: string;
    regionId: string;
    cityId: string;
    addressLine?: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    amenities: string[];
    offerType?: "sell" | "lease";
    askingPriceKobo?: bigint;
    leaseTerms?: string;
    acquisitionCostKobo?: bigint;
    estimatedAnnualRevenueKobo?: bigint;
    occupancyRateEstimate?: number;
    operatingCostEstimateKobo?: bigint;
  }): Promise<Property> {
    const created = await prisma.property.create({
      data: {
        ownerId: input.ownerId ?? null,
        sourceType: input.sourceType ?? "owner_offer",
        title: input.title,
        description: input.description,
        type: input.type,
        countryId: input.countryId,
        regionId: input.regionId,
        cityId: input.cityId,
        addressLine: input.addressLine ?? null,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        maxGuests: input.maxGuests,
        amenities: input.amenities,
        offerType: input.offerType ?? null,
        askingPriceKobo: input.askingPriceKobo ?? null,
        leaseTerms: input.leaseTerms ?? null,
        acquisitionCostKobo: input.acquisitionCostKobo ?? null,
        estimatedAnnualRevenueKobo: input.estimatedAnnualRevenueKobo ?? null,
        occupancyRateEstimate:
          input.occupancyRateEstimate !== undefined
            ? String(input.occupancyRateEstimate)
            : null,
        operatingCostEstimateKobo: input.operatingCostEstimateKobo ?? null,
        status: "submitted",
        reviewNotes: [],
      },
      include: INCLUDE,
    });
    return toFrontend(created);
  },

  async updateStatus(
    id: string,
    status: PropertyStatus,
    note?: { note: string; byAdminId: string }
  ): Promise<Property | undefined> {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return undefined;

    const existingNotes =
      (existing.reviewNotes as
        | { note: string; byAdminId: string; at: string }[]
        | null) ?? [];
    const reviewNotes = note
      ? [...existingNotes, { ...note, at: new Date().toISOString() }]
      : existingNotes;

    const row = await prisma.property.update({
      where: { id },
      data: {
        status: status as DbPropertyStatus,
        reviewNotes: reviewNotes as never,
      },
      include: INCLUDE,
    });
    return toFrontend(row);
  },

  async updateProperty(
    id: string,
    patch: {
      title?: string;
      description?: string;
      type?: string;
      bedrooms?: number;
      bathrooms?: number;
      maxGuests?: number;
      amenities?: string[];
      addressLine?: string | null;
      countryId?: string;
      regionId?: string;
      cityId?: string;
      status?: PropertyStatus;
      acquisitionCostKobo?: bigint;
      estimatedAnnualRevenueKobo?: bigint;
      occupancyRateEstimate?: number;
      operatingCostEstimateKobo?: bigint;
    }
  ): Promise<Property | undefined> {
    const row = await prisma.property
      .update({
        where: { id },
        data: {
          ...(patch.title !== undefined && { title: patch.title }),
          ...(patch.description !== undefined && {
            description: patch.description,
          }),
          ...(patch.type !== undefined && { type: patch.type }),
          ...(patch.bedrooms !== undefined && { bedrooms: patch.bedrooms }),
          ...(patch.bathrooms !== undefined && { bathrooms: patch.bathrooms }),
          ...(patch.maxGuests !== undefined && { maxGuests: patch.maxGuests }),
          ...(patch.amenities !== undefined && { amenities: patch.amenities }),
          ...(patch.addressLine !== undefined && {
            addressLine: patch.addressLine,
          }),
          ...(patch.countryId !== undefined && { countryId: patch.countryId }),
          ...(patch.regionId !== undefined && { regionId: patch.regionId }),
          ...(patch.cityId !== undefined && { cityId: patch.cityId }),
          ...(patch.status !== undefined && {
            status: patch.status as DbPropertyStatus,
          }),
          ...(patch.acquisitionCostKobo !== undefined && {
            acquisitionCostKobo: patch.acquisitionCostKobo,
          }),
          ...(patch.estimatedAnnualRevenueKobo !== undefined && {
            estimatedAnnualRevenueKobo: patch.estimatedAnnualRevenueKobo,
          }),
          ...(patch.occupancyRateEstimate !== undefined && {
            occupancyRateEstimate: String(patch.occupancyRateEstimate),
          }),
          ...(patch.operatingCostEstimateKobo !== undefined && {
            operatingCostEstimateKobo: patch.operatingCostEstimateKobo,
          }),
        },
        include: INCLUDE,
      })
      .catch(() => null);
    return row ? toFrontend(row) : undefined;
  },

  async setPropertyImages(
    propertyId: string,
    images: { storageKey: string; url?: string; caption?: string }[]
  ): Promise<Property> {
    if (images.length > 10) {
      throw new Error(
        `A property can have at most 10 images (got ${images.length})`
      );
    }
    await prisma.$transaction(async (tx) => {
      await tx.propertyImage.deleteMany({ where: { propertyId } });
      if (images.length > 0) {
        await tx.propertyImage.createMany({
          data: images.map((img, position) => ({
            propertyId,
            storageKey: img.storageKey,
            url: img.url ?? null,
            caption: img.caption ?? null,
            position,
          })),
        });
      }
    });
    const row = await prisma.property.findUniqueOrThrow({
      where: { id: propertyId },
      include: INCLUDE,
    });
    return toFrontend(row);
  },

  /**
   * @deprecated No-op. Seeding lives in prisma/seed.ts.
   */
  seedProperties(_items: Property[]): void {
    // intentionally empty
  },
};
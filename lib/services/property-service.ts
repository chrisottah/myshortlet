// lib/services/property-service.ts

import { MockRepository, generateId } from "./mock-db";
import { Property, PropertyStatus } from "@/lib/types";

const propertyRepo = new MockRepository<Property>();

export const propertyService = {
  getAll(): Property[] {
    return propertyRepo.findAll();
  },

  getById(id: string): Property | undefined {
    return propertyRepo.findById(id);
  },

  getByOwnerId(ownerId: string): Property[] {
    return propertyRepo.findWhere((p) => p.ownerId === ownerId);
  },

  getByStatus(status: PropertyStatus): Property[] {
    return propertyRepo.findWhere((p) => p.status === status);
  },

  seedProperties(items: Property[]) {
    items.forEach((item) => propertyRepo.create(item));
  },

  submitProperty(
    input: Omit<Property, "id" | "status" | "createdAt" | "updatedAt" | "reviewNotes">
  ): Property {
    const now = new Date().toISOString();
    const property: Property = {
      ...input,
      id: generateId("prop"),
      status: "submitted",
      reviewNotes: [],
      createdAt: now,
      updatedAt: now,
    };
    return propertyRepo.create(property);
  },

  updateStatus(
    id: string,
    status: PropertyStatus,
    note?: { note: string; byAdminId: string }
  ): Property | undefined {
    const property = propertyRepo.findById(id);
    if (!property) return undefined;

    const reviewNotes = note
      ? [
          ...(property.reviewNotes ?? []),
          { ...note, at: new Date().toISOString() },
        ]
      : property.reviewNotes;

    return propertyRepo.update(id, {
      status,
      reviewNotes,
      updatedAt: new Date().toISOString(),
    });
  },

  updateProperty(id: string, patch: Partial<Property>): Property | undefined {
    return propertyRepo.update(id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  },
};
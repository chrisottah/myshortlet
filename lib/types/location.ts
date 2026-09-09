// lib/types/location.ts

export interface Country {
  id: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2, e.g. "NG"
  currency: string; // ISO 4217, e.g. "NGN"
}

export interface Region {
  id: string;
  countryId: string;
  name: string; // e.g. "Lagos State"
}

export interface City {
  id: string;
  regionId: string;
  name: string; // e.g. "Lekki"
}

export interface Location {
  countryId: string;
  regionId: string;
  cityId: string;
  address?: string;
  lat?: number;
  lng?: number;
}
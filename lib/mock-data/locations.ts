// lib/mock-data/locations.ts

import { Country, Region, City } from "@/lib/types";

export const countries: Country[] = [
  { id: "country_ng", name: "Nigeria", code: "NG", currency: "NGN" },
];

export const regions: Region[] = [
  { id: "region_lagos", countryId: "country_ng", name: "Lagos State" },
];

export const cities: City[] = [
  { id: "city_lekki", regionId: "region_lagos", name: "Lekki" },
  { id: "city_ikoyi", regionId: "region_lagos", name: "Ikoyi" },
  { id: "city_vi", regionId: "region_lagos", name: "Victoria Island" },
  { id: "city_ikeja", regionId: "region_lagos", name: "Ikeja GRA" },
  { id: "city_ajah", regionId: "region_lagos", name: "Ajah" },
];
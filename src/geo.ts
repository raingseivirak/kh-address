import type { Province, District, Commune, GeoData } from "./types.js";
import {
  getProvinces,
  getProvinceByCode,
  getDistricts,
  getDistrictByCode,
  getCommunes,
  getCommuneByCode,
} from "./data.js";

export interface GeoResult {
  code: string;
  nameEn: string;
  nameKm: string;
  type: "province" | "district" | "commune";
  geodata: GeoData;
  distanceKm: number;
}

export interface NearestAddressResult {
  province: Province;
  district: District;
  commune: Commune;
  distanceKm: number;
}

export function getCoordinates(
  code: string
): GeoData | undefined {
  if (code.length === 2) return getProvinceByCode(code)?.geodata ?? undefined;
  if (code.length === 4) return getDistrictByCode(code)?.geodata ?? undefined;
  if (code.length >= 6)
    return getCommuneByCode(code.substring(0, 6))?.geodata ?? undefined;
  return undefined;
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearest(
  lat: number,
  lng: number,
  options: { type?: "province" | "district" | "commune"; limit?: number } = {}
): GeoResult[] {
  const { type = "commune", limit = 5 } = options;

  let items: { code: string; nameEn: string; nameKm: string; geodata: GeoData | null; type: "province" | "district" | "commune" }[];

  if (type === "province") {
    items = getProvinces().map((p) => ({ ...p, type: "province" as const }));
  } else if (type === "district") {
    items = getDistricts().map((d) => ({ ...d, type: "district" as const }));
  } else {
    items = getCommunes().map((c) => ({ ...c, type: "commune" as const }));
  }

  const results: GeoResult[] = [];

  for (const item of items) {
    if (!item.geodata) continue;
    const dist = haversineKm(lat, lng, item.geodata.lat, item.geodata.lng);
    results.push({
      code: item.code,
      nameEn: item.nameEn,
      nameKm: item.nameKm,
      type: item.type,
      geodata: item.geodata,
      distanceKm: Math.round(dist * 100) / 100,
    });
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results.slice(0, limit);
}

export function findNearestAddress(
  lat: number,
  lng: number
): NearestAddressResult | undefined {
  const nearest = findNearest(lat, lng, { type: "commune", limit: 1 });
  if (nearest.length === 0) return undefined;

  const commune = getCommuneByCode(nearest[0].code);
  if (!commune) return undefined;

  const district = getDistrictByCode(commune.districtCode);
  const province = getProvinceByCode(commune.provinceCode);
  if (!district || !province) return undefined;

  return {
    province,
    district,
    commune,
    distanceKm: nearest[0].distanceKm,
  };
}

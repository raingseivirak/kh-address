import type { Language, StructuredAddress } from "./types.js";
import {
  getProvinces,
  getProvinceByCode,
  getDistricts,
  getDistrictByCode,
  getCommunes,
  getCommuneByCode,
  getVillageByCode,
} from "./data.js";

export function formatAddress(
  address: StructuredAddress,
  language: Language = "en"
): string {
  const parts: string[] = [];
  const key = language === "km" ? "nameKm" : "nameEn";

  if (address.village) parts.push(address.village[key]);
  if (address.commune) parts.push(address.commune[key]);
  if (address.district) parts.push(address.district[key]);
  if (address.province) parts.push(address.province[key]);

  return parts.join(", ");
}

export function formatAddressFromCode(
  code: string,
  language: Language = "en"
): string {
  const parts: string[] = [];
  const key = language === "km" ? "nameKm" : "nameEn";

  const provinceCode = code.substring(0, 2);
  const province = getProvinceByCode(provinceCode);
  if (province) parts.unshift(province[key]);

  if (code.length >= 4) {
    const districtCode = code.substring(0, 4);
    const district = getDistrictByCode(districtCode);
    if (district) parts.unshift(district[key]);
  }

  if (code.length >= 6) {
    const communeCode = code.substring(0, 6);
    const commune = getCommuneByCode(communeCode);
    if (commune) parts.unshift(commune[key]);
  }

  return parts.join(", ");
}

export function formatFullAddressFromCode(
  villageCode: string,
  language: Language = "en"
): string {
  const parts: string[] = [];
  const key = language === "km" ? "nameKm" : "nameEn";

  const village = getVillageByCode(villageCode);
  if (village) parts.push(village[key]);

  const communeCode = villageCode.substring(0, 6);
  const commune = getCommuneByCode(communeCode);
  if (commune) parts.push(commune[key]);

  const districtCode = villageCode.substring(0, 4);
  const district = getDistrictByCode(districtCode);
  if (district) parts.push(district[key]);

  const provinceCode = villageCode.substring(0, 2);
  const province = getProvinceByCode(provinceCode);
  if (province) parts.push(province[key]);

  return parts.join(", ");
}

export function parseAddress(
  input: string
): { provinceCode?: string; districtCode?: string; communeCode?: string } {
  const normalized = input.trim();
  if (!normalized) return {};

  const segments = normalized
    .split(/[,៣]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const allProvinces = getProvinces();
  const allDistricts = getDistricts();
  const allCommunes = getCommunes();

  let provinceCode: string | undefined;
  let districtCode: string | undefined;
  let communeCode: string | undefined;

  for (const segment of segments) {
    const lower = segment.toLowerCase();
    for (const p of allProvinces) {
      if (
        p.nameEn.toLowerCase() === lower ||
        p.nameKm === segment ||
        p.nameEn.toLowerCase().includes(lower) ||
        p.nameKm.includes(segment)
      ) {
        provinceCode = p.code;
        break;
      }
    }
    if (provinceCode) break;
  }

  if (provinceCode) {
    for (const segment of segments) {
      const lower = segment.toLowerCase();
      for (const d of allDistricts) {
        if (d.provinceCode !== provinceCode) continue;
        if (
          d.nameEn.toLowerCase() === lower ||
          d.nameKm === segment ||
          d.nameEn.toLowerCase().includes(lower) ||
          d.nameKm.includes(segment)
        ) {
          districtCode = d.code;
          break;
        }
      }
      if (districtCode) break;
    }
  }

  if (districtCode) {
    for (const segment of segments) {
      const lower = segment.toLowerCase();
      for (const c of allCommunes) {
        if (c.districtCode !== districtCode) continue;
        if (
          c.nameEn.toLowerCase() === lower ||
          c.nameKm === segment ||
          c.nameEn.toLowerCase().includes(lower) ||
          c.nameKm.includes(segment)
        ) {
          communeCode = c.code;
          break;
        }
      }
      if (communeCode) break;
    }
  }

  return { provinceCode, districtCode, communeCode };
}

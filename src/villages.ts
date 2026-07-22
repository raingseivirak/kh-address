import type { Village, Commune, District, Province } from "./types.js";
import villagesData from "./data/villages.json";
import { getProvinceByCode, getDistrictByCode, getCommuneByCode } from "./data.js";

const villages = villagesData as Record<string, Village>;

export function getVillages(communeCode?: string): Village[] {
  const all = Object.values(villages);
  if (!communeCode) return all;
  return all.filter((v) => v.communeCode === communeCode);
}

export function getVillagesByDistrict(districtCode: string): Village[] {
  return Object.values(villages).filter(
    (v) => v.districtCode === districtCode
  );
}

export function getVillagesByProvince(provinceCode: string): Village[] {
  return Object.values(villages).filter(
    (v) => v.provinceCode === provinceCode
  );
}

export function getVillageByCode(code: string): Village | undefined {
  return villages[code];
}

export function getFullAddressWithVillage(villageCode: string): {
  village?: Village;
  commune?: Commune;
  district?: District;
  province?: Province;
} {
  return {
    village: villages[villageCode],
    commune: getCommuneByCode(villageCode.substring(0, 6)),
    district: getDistrictByCode(villageCode.substring(0, 4)),
    province: getProvinceByCode(villageCode.substring(0, 2)),
  };
}

export { villages };

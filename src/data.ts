import type { Province, District, Commune } from "./types.js";
import provincesData from "./data/provinces.json";
import districtsData from "./data/districts.json";
import communesData from "./data/communes.json";

const provinces = provincesData as Record<string, Province>;
const districts = districtsData as Record<string, District>;
const communes = communesData as Record<string, Commune>;

// --- Province ---

export function getProvinces(): Province[] {
  return Object.values(provinces);
}

export function getProvinceByCode(code: string): Province | undefined {
  return provinces[code];
}

// --- District ---

export function getDistricts(provinceCode?: string): District[] {
  const all = Object.values(districts);
  if (!provinceCode) return all;
  return all.filter((d) => d.provinceCode === provinceCode);
}

export function getDistrictByCode(code: string): District | undefined {
  return districts[code];
}

// --- Commune ---

export function getCommunes(districtCode?: string): Commune[] {
  const all = Object.values(communes);
  if (!districtCode) return all;
  return all.filter((c) => c.districtCode === districtCode);
}

export function getCommunesByProvince(provinceCode: string): Commune[] {
  return Object.values(communes).filter(
    (c) => c.provinceCode === provinceCode
  );
}

export function getCommuneByCode(code: string): Commune | undefined {
  return communes[code];
}

// --- Lookup helpers ---

export function getFullAddress(code: string): {
  commune?: Commune;
  district?: District;
  province?: Province;
} {
  const provinceCode = code.substring(0, 2);
  const districtCode = code.substring(0, 4);
  const communeCode = code.substring(0, 6);

  return {
    province: provinces[provinceCode],
    district: districts[districtCode],
    commune: communes[communeCode],
  };
}

export { provinces, districts, communes };

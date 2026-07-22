export interface AdministrativeUnit {
  nameKm: string;
  nameEn: string;
  nameLatin: string;
}

export interface GeoData {
  lat: number;
  lng: number;
}

export interface Province {
  code: string;
  nameKm: string;
  nameEn: string;
  nameUngegn: string | null;
  administrativeUnit: AdministrativeUnit;
  iso3166: string | null;
  geodata: GeoData | null;
}

export interface District {
  code: string;
  provinceCode: string;
  nameKm: string;
  nameEn: string;
  nameUngegn: string | null;
  administrativeUnit: AdministrativeUnit;
  geodata: GeoData | null;
}

export interface Commune {
  code: string;
  districtCode: string;
  provinceCode: string;
  nameKm: string;
  nameEn: string;
  nameUngegn: string | null;
  administrativeUnit: AdministrativeUnit;
  geodata: GeoData | null;
}

export interface Village {
  code: string;
  communeCode: string;
  districtCode: string;
  provinceCode: string;
  nameKm: string;
  nameEn: string;
}

export interface SearchResult {
  type: "province" | "district" | "commune" | "village";
  code: string;
  nameEn: string;
  nameKm: string;
  score: number;
  province?: { code: string; nameEn: string; nameKm: string };
  district?: { code: string; nameEn: string; nameKm: string };
  commune?: { code: string; nameEn: string; nameKm: string };
}

export interface StructuredAddress {
  province?: Province;
  district?: District;
  commune?: Commune;
  village?: Village;
  streetNumber?: string;
  houseNumber?: string;
  groupNumber?: string;
}

export type Language = "en" | "km";

export type AddressFormat = "short" | "formal";

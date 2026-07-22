interface AdministrativeUnit {
    nameKm: string;
    nameEn: string;
    nameLatin: string;
}
interface GeoData {
    lat: number;
    lng: number;
}
interface Province {
    code: string;
    nameKm: string;
    nameEn: string;
    nameUngegn: string | null;
    administrativeUnit: AdministrativeUnit;
    iso3166: string | null;
    geodata: GeoData | null;
}
interface District {
    code: string;
    provinceCode: string;
    nameKm: string;
    nameEn: string;
    nameUngegn: string | null;
    administrativeUnit: AdministrativeUnit;
    geodata: GeoData | null;
}
interface Commune {
    code: string;
    districtCode: string;
    provinceCode: string;
    nameKm: string;
    nameEn: string;
    nameUngegn: string | null;
    administrativeUnit: AdministrativeUnit;
    geodata: GeoData | null;
}
interface Village {
    code: string;
    communeCode: string;
    districtCode: string;
    provinceCode: string;
    nameKm: string;
    nameEn: string;
}
interface SearchResult {
    type: "province" | "district" | "commune" | "village";
    code: string;
    nameEn: string;
    nameKm: string;
    score: number;
    province?: {
        code: string;
        nameEn: string;
        nameKm: string;
    };
    district?: {
        code: string;
        nameEn: string;
        nameKm: string;
    };
    commune?: {
        code: string;
        nameEn: string;
        nameKm: string;
    };
}
interface StructuredAddress {
    province?: Province;
    district?: District;
    commune?: Commune;
    village?: Village;
}
type Language = "en" | "km";

declare function getProvinces(): Province[];
declare function getProvinceByCode(code: string): Province | undefined;
declare function getDistricts(provinceCode?: string): District[];
declare function getDistrictByCode(code: string): District | undefined;
declare function getCommunes(districtCode?: string): Commune[];
declare function getCommunesByProvince(provinceCode: string): Commune[];
declare function getCommuneByCode(code: string): Commune | undefined;
declare function getVillages(communeCode?: string): Village[];
declare function getVillagesByDistrict(districtCode: string): Village[];
declare function getVillagesByProvince(provinceCode: string): Village[];
declare function getVillageByCode(code: string): Village | undefined;
declare function getFullAddress(villageOrCode: Village | string): {
    village?: Village;
    commune?: Commune;
    district?: District;
    province?: Province;
};

interface SearchOptions {
    limit?: number;
    type?: "province" | "district" | "commune";
    provinceCode?: string;
}
declare function searchAddress(query: string, options?: SearchOptions): SearchResult[];

declare function formatAddress(address: StructuredAddress, language?: Language): string;
declare function formatAddressFromCode(code: string, language?: Language): string;
declare function formatFullAddressFromCode(villageCode: string, language?: Language): string;
declare function parseAddress(input: string): {
    provinceCode?: string;
    districtCode?: string;
    communeCode?: string;
};

export { type AdministrativeUnit, type Commune, type District, type GeoData, type Language, type Province, type SearchOptions, type SearchResult, type StructuredAddress, type Village, formatAddress, formatAddressFromCode, formatFullAddressFromCode, getCommuneByCode, getCommunes, getCommunesByProvince, getDistrictByCode, getDistricts, getFullAddress, getProvinceByCode, getProvinces, getVillageByCode, getVillages, getVillagesByDistrict, getVillagesByProvince, parseAddress, searchAddress };

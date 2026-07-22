import { C as Commune, D as District, P as Province, S as SearchResult, a as StructuredAddress, L as Language } from './types-D09QxsWl.cjs';
export { A as AdministrativeUnit, G as GeoData, V as Village } from './types-D09QxsWl.cjs';

declare function getProvinces(): Province[];
declare function getProvinceByCode(code: string): Province | undefined;
declare function getDistricts(provinceCode?: string): District[];
declare function getDistrictByCode(code: string): District | undefined;
declare function getCommunes(districtCode?: string): Commune[];
declare function getCommunesByProvince(provinceCode: string): Commune[];
declare function getCommuneByCode(code: string): Commune | undefined;
declare function getFullAddress(code: string): {
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
declare function parseAddress(input: string): {
    provinceCode?: string;
    districtCode?: string;
    communeCode?: string;
};

declare function getPostalCode(adminCode: string): string | undefined;
declare function lookupByPostalCode(postalCode: string): {
    provinceCode?: string;
    districtCode?: string;
    communeCode?: string;
};

export { Commune, District, Language, Province, type SearchOptions, SearchResult, StructuredAddress, formatAddress, formatAddressFromCode, getCommuneByCode, getCommunes, getCommunesByProvince, getDistrictByCode, getDistricts, getFullAddress, getPostalCode, getProvinceByCode, getProvinces, lookupByPostalCode, parseAddress, searchAddress };

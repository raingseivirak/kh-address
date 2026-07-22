import { C as Commune, D as District, P as Province, S as SearchResult, L as Language, A as AddressFormat, a as StructuredAddress } from './types-LZ0vMibT.cjs';
export { b as AdministrativeUnit, G as GeoData, V as Village } from './types-LZ0vMibT.cjs';

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

interface FormatOptions {
    language?: Language;
    format?: AddressFormat;
}
declare function formatAddress(address: StructuredAddress, options?: FormatOptions | Language): string;
declare function formatAddressFromCode(code: string, options?: FormatOptions | Language): string;
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

export { AddressFormat, Commune, District, type FormatOptions, Language, Province, type SearchOptions, SearchResult, StructuredAddress, formatAddress, formatAddressFromCode, getCommuneByCode, getCommunes, getCommunesByProvince, getDistrictByCode, getDistricts, getFullAddress, getPostalCode, getProvinceByCode, getProvinces, lookupByPostalCode, parseAddress, searchAddress };

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

export type { AdministrativeUnit as A, Commune as C, District as D, GeoData as G, Language as L, Province as P, SearchResult as S, Village as V, StructuredAddress as a };

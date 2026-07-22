import { G as GeoData, P as Province, D as District, C as Commune } from './types-LZ0vMibT.js';

interface GeoResult {
    code: string;
    nameEn: string;
    nameKm: string;
    type: "province" | "district" | "commune";
    geodata: GeoData;
    distanceKm: number;
}
interface NearestAddressResult {
    province: Province;
    district: District;
    commune: Commune;
    distanceKm: number;
}
declare function getCoordinates(code: string): GeoData | undefined;
declare function findNearest(lat: number, lng: number, options?: {
    type?: "province" | "district" | "commune";
    limit?: number;
}): GeoResult[];
declare function findNearestAddress(lat: number, lng: number): NearestAddressResult | undefined;

export { type GeoResult, type NearestAddressResult, findNearest, findNearestAddress, getCoordinates };

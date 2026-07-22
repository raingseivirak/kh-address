import { V as Village, C as Commune, D as District, P as Province } from './types-D09QxsWl.js';

declare const villages: Record<string, Village>;
declare function getVillages(communeCode?: string): Village[];
declare function getVillagesByDistrict(districtCode: string): Village[];
declare function getVillagesByProvince(provinceCode: string): Village[];
declare function getVillageByCode(code: string): Village | undefined;
declare function getFullAddressWithVillage(villageCode: string): {
    village?: Village;
    commune?: Commune;
    district?: District;
    province?: Province;
};

export { getFullAddressWithVillage, getVillageByCode, getVillages, getVillagesByDistrict, getVillagesByProvince, villages };

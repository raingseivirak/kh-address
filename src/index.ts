export type {
  Province,
  District,
  Commune,
  Village,
  AdministrativeUnit,
  GeoData,
  SearchResult,
  StructuredAddress,
  Language,
  AddressFormat,
} from "./types.js";

export {
  getProvinces,
  getProvinceByCode,
  getDistricts,
  getDistrictByCode,
  getCommunes,
  getCommunesByProvince,
  getCommuneByCode,
  getFullAddress,
} from "./data.js";

export { searchAddress } from "./search.js";
export type { SearchOptions } from "./search.js";

export {
  formatAddress,
  formatAddressFromCode,
  parseAddress,
} from "./format.js";
export type { FormatOptions } from "./format.js";

export { getPostalCode, lookupByPostalCode } from "./postal.js";


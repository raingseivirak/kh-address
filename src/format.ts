import type { Language, StructuredAddress, AddressFormat } from "./types.js";
import {
  getProvinces,
  getProvinceByCode,
  getDistricts,
  getDistrictByCode,
  getCommunes,
  getCommuneByCode,
} from "./data.js";

export interface FormatOptions {
  language?: Language;
  format?: AddressFormat;
}

function formatLevelKm(
  unitKm: string,
  nameKm: string,
  format: AddressFormat
): string {
  if (format === "short") return nameKm;
  return unitKm + nameKm;
}

function formatLevelEn(
  unitLatin: string,
  nameEn: string,
  format: AddressFormat
): string {
  if (format === "short") return nameEn;
  return unitLatin + " " + nameEn;
}

export function formatAddress(
  address: StructuredAddress,
  options: FormatOptions | Language = "en"
): string {
  const { language, format } = normalizeOptions(options);
  const isKm = language === "km";
  const parts: string[] = [];

  if (isKm) {
    if (address.houseNumber) parts.push("ផ្ទះលេខ " + address.houseNumber);
    if (address.streetNumber) parts.push("ផ្លូវលេខ " + address.streetNumber);
    if (address.groupNumber) parts.push("ក្រុមទី " + address.groupNumber);
    if (address.village)
      parts.push(formatLevelKm("ភូមិ", address.village.nameKm, format));
    if (address.commune)
      parts.push(
        formatLevelKm(
          address.commune.administrativeUnit.nameKm,
          address.commune.nameKm,
          format
        )
      );
    if (address.district)
      parts.push(
        formatLevelKm(
          address.district.administrativeUnit.nameKm,
          address.district.nameKm,
          format
        )
      );
    if (address.province)
      parts.push(
        formatLevelKm(
          address.province.administrativeUnit.nameKm,
          address.province.nameKm,
          format
        )
      );
    return parts.join(" ");
  }

  if (address.houseNumber) parts.push("#" + address.houseNumber);
  if (address.streetNumber) parts.push("Street " + address.streetNumber);
  if (address.groupNumber) parts.push("Group " + address.groupNumber);
  if (address.village)
    parts.push(formatLevelEn("Phum", address.village.nameEn, format));
  if (address.commune)
    parts.push(
      formatLevelEn(
        address.commune.administrativeUnit.nameLatin,
        address.commune.nameEn,
        format
      )
    );
  if (address.district)
    parts.push(
      formatLevelEn(
        address.district.administrativeUnit.nameLatin,
        address.district.nameEn,
        format
      )
    );
  if (address.province)
    parts.push(
      formatLevelEn(
        address.province.administrativeUnit.nameLatin,
        address.province.nameEn,
        format
      )
    );
  return parts.join(", ");
}

export function formatAddressFromCode(
  code: string,
  options: FormatOptions | Language = "en"
): string {
  const { language, format } = normalizeOptions(options);
  const isKm = language === "km";
  const parts: string[] = [];

  const provinceCode = code.substring(0, 2);
  const province = getProvinceByCode(provinceCode);

  if (province) {
    const formatted = isKm
      ? formatLevelKm(province.administrativeUnit.nameKm, province.nameKm, format)
      : formatLevelEn(province.administrativeUnit.nameLatin, province.nameEn, format);
    parts.unshift(formatted);
  }

  if (code.length >= 4) {
    const districtCode = code.substring(0, 4);
    const district = getDistrictByCode(districtCode);
    if (district) {
      const formatted = isKm
        ? formatLevelKm(district.administrativeUnit.nameKm, district.nameKm, format)
        : formatLevelEn(district.administrativeUnit.nameLatin, district.nameEn, format);
      parts.unshift(formatted);
    }
  }

  if (code.length >= 6) {
    const communeCode = code.substring(0, 6);
    const commune = getCommuneByCode(communeCode);
    if (commune) {
      const formatted = isKm
        ? formatLevelKm(commune.administrativeUnit.nameKm, commune.nameKm, format)
        : formatLevelEn(commune.administrativeUnit.nameLatin, commune.nameEn, format);
      parts.unshift(formatted);
    }
  }

  return isKm ? parts.join(" ") : parts.join(", ");
}

function normalizeOptions(
  options: FormatOptions | Language
): { language: Language; format: AddressFormat } {
  if (typeof options === "string") {
    return { language: options, format: "formal" };
  }
  return {
    language: options.language || "en",
    format: options.format || "formal",
  };
}

export function parseAddress(
  input: string
): { provinceCode?: string; districtCode?: string; communeCode?: string } {
  const normalized = input.trim();
  if (!normalized) return {};

  const isKhmer = /[ក-៿]/.test(normalized);

  const rawSegments = isKhmer
    ? normalized.split(/\s+/)
    : normalized.split(/,/);

  const segments = rawSegments
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) =>
      s
        .replace(/^(ខេត្ត|រាជធានី|ស្រុក|ក្រុង|ខណ្ឌ|ឃុំ|សង្កាត់|ភូមិ)/, "")
        .replace(/^(Sangkat|Khum|Khan|Srok|Krong|Khaet|Reach Theani|Phum)\s+/i, "")
        .trim()
    )
    .filter(Boolean);

  const allProvinces = getProvinces();
  const allDistricts = getDistricts();
  const allCommunes = getCommunes();

  let provinceCode: string | undefined;
  let districtCode: string | undefined;
  let communeCode: string | undefined;

  for (const segment of segments) {
    const lower = segment.toLowerCase();
    for (const p of allProvinces) {
      if (
        p.nameEn.toLowerCase() === lower ||
        p.nameKm === segment ||
        p.nameEn.toLowerCase().includes(lower) ||
        p.nameKm.includes(segment)
      ) {
        provinceCode = p.code;
        break;
      }
    }
    if (provinceCode) break;
  }

  if (provinceCode) {
    for (const segment of segments) {
      const lower = segment.toLowerCase();
      for (const d of allDistricts) {
        if (d.provinceCode !== provinceCode) continue;
        if (
          d.nameEn.toLowerCase() === lower ||
          d.nameKm === segment ||
          d.nameEn.toLowerCase().includes(lower) ||
          d.nameKm.includes(segment)
        ) {
          districtCode = d.code;
          break;
        }
      }
      if (districtCode) break;
    }
  }

  if (districtCode) {
    for (const segment of segments) {
      const lower = segment.toLowerCase();
      for (const c of allCommunes) {
        if (c.districtCode !== districtCode) continue;
        if (
          c.nameEn.toLowerCase() === lower ||
          c.nameKm === segment ||
          c.nameEn.toLowerCase().includes(lower) ||
          c.nameKm.includes(segment)
        ) {
          communeCode = c.code;
          break;
        }
      }
      if (communeCode) break;
    }
  }

  return { provinceCode, districtCode, communeCode };
}

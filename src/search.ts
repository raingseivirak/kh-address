import type { SearchResult } from "./types.js";
import searchIndexData from "./data/search-index.json";
import { provinces, districts } from "./data.js";

interface SearchEntry {
  t: "province" | "district" | "commune";
  c: string;
  en: string;
  km: string;
  pc?: string;
  dc?: string;
}

const searchIndex = searchIndexData as SearchEntry[];

export interface SearchOptions {
  limit?: number;
  type?: "province" | "district" | "commune";
  provinceCode?: string;
}

export function searchAddress(
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const { limit = 10, type, provinceCode } = options;

  if (!query || query.trim().length === 0) return [];

  const q = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  for (const entry of searchIndex) {
    if (type && entry.t !== type) continue;
    if (provinceCode && entry.pc !== provinceCode && entry.c !== provinceCode)
      continue;

    const enLower = entry.en.toLowerCase();
    const km = entry.km;

    let score = 0;

    if (enLower === q || km === q) {
      score = 100;
    } else if (enLower.startsWith(q) || km.startsWith(q)) {
      score = 80;
    } else if (enLower.includes(q) || km.includes(q)) {
      score = 60;
    }

    if (score === 0) continue;

    if (entry.t === "province") score += 3;
    else if (entry.t === "district") score += 2;
    else score += 1;

    const result: SearchResult = {
      type: entry.t,
      code: entry.c,
      nameEn: entry.en,
      nameKm: entry.km,
      score,
    };

    if (entry.pc) {
      const prov = provinces[entry.pc];
      if (prov) {
        result.province = {
          code: prov.code,
          nameEn: prov.nameEn,
          nameKm: prov.nameKm,
        };
      }
    }

    if (entry.dc) {
      const dist = districts[entry.dc];
      if (dist) {
        result.district = {
          code: dist.code,
          nameEn: dist.nameEn,
          nameKm: dist.nameKm,
        };
      }
    }

    results.push(result);
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

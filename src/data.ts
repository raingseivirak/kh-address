import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { Province, District, Commune, Village } from "./types.js";
import provincesData from "./data/provinces.json";
import districtsData from "./data/districts.json";
import communesData from "./data/communes.json";

const provinces = provincesData as Record<string, Province>;
const districts = districtsData as Record<string, District>;
const communes = communesData as Record<string, Commune>;

const villageCache = new Map<string, Record<string, Village>>();

type VillageLoader = (
  provinceCode: string
) => Promise<Record<string, Village>>;

let _villageLoader: VillageLoader | undefined;

export function setVillageLoader(loader: VillageLoader): void {
  _villageLoader = loader;
}

// --- Province ---

export function getProvinces(): Province[] {
  return Object.values(provinces);
}

export function getProvinceByCode(code: string): Province | undefined {
  return provinces[code];
}

// --- District ---

export function getDistricts(provinceCode?: string): District[] {
  const all = Object.values(districts);
  if (!provinceCode) return all;
  return all.filter((d) => d.provinceCode === provinceCode);
}

export function getDistrictByCode(code: string): District | undefined {
  return districts[code];
}

// --- Commune ---

export function getCommunes(districtCode?: string): Commune[] {
  const all = Object.values(communes);
  if (!districtCode) return all;
  return all.filter((c) => c.districtCode === districtCode);
}

export function getCommunesByProvince(provinceCode: string): Commune[] {
  return Object.values(communes).filter(
    (c) => c.provinceCode === provinceCode
  );
}

export function getCommuneByCode(code: string): Commune | undefined {
  return communes[code];
}

// --- Village (lazy loaded) ---

export async function getVillages(communeCode?: string): Promise<Village[]> {
  if (!communeCode) {
    const all: Village[] = [];
    const codes = new Set(
      Object.values(communes).map((c) => c.provinceCode)
    );
    for (const pc of codes) {
      const chunk = await loadVillageChunk(pc);
      all.push(...Object.values(chunk));
    }
    return all;
  }

  const provinceCode = communeCode.substring(0, 2);
  const chunk = await loadVillageChunk(provinceCode);
  return Object.values(chunk).filter((v) => v.communeCode === communeCode);
}

export async function getVillagesByDistrict(
  districtCode: string
): Promise<Village[]> {
  const provinceCode = districtCode.substring(0, 2);
  const chunk = await loadVillageChunk(provinceCode);
  return Object.values(chunk).filter((v) => v.districtCode === districtCode);
}

export async function getVillagesByProvince(
  provinceCode: string
): Promise<Village[]> {
  const chunk = await loadVillageChunk(provinceCode);
  return Object.values(chunk);
}

export async function getVillageByCode(
  code: string
): Promise<Village | undefined> {
  const provinceCode = code.substring(0, 2);
  const chunk = await loadVillageChunk(provinceCode);
  return chunk[code];
}

function resolveVillagesDir(): string {
  let baseDir: string;
  try {
    baseDir = dirname(fileURLToPath(import.meta.url));
  } catch {
    baseDir = __dirname;
  }

  const candidates = [
    join(baseDir, "villages"),
    join(baseDir, "data", "villages"),
  ];

  for (const dir of candidates) {
    try {
      readFileSync(join(dir, "01.json"), "utf-8");
      return dir;
    } catch {
      // try next
    }
  }

  return candidates[0];
}

let _villagesDir: string | undefined;

function getVillagesDir(): string {
  if (!_villagesDir) _villagesDir = resolveVillagesDir();
  return _villagesDir;
}

async function defaultLoader(
  provinceCode: string
): Promise<Record<string, Village>> {
  const filePath = join(getVillagesDir(), `${provinceCode}.json`);
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

async function loadVillageChunk(
  provinceCode: string
): Promise<Record<string, Village>> {
  if (villageCache.has(provinceCode)) {
    return villageCache.get(provinceCode)!;
  }

  try {
    const loader = _villageLoader ?? defaultLoader;
    const data = await loader(provinceCode);
    villageCache.set(provinceCode, data);
    return data;
  } catch {
    villageCache.set(provinceCode, {});
    return {};
  }
}

export async function preload(provinceCode: string): Promise<void> {
  await loadVillageChunk(provinceCode);
}

export async function preloadAll(): Promise<void> {
  const codes = Object.keys(provinces);
  await Promise.all(codes.map(loadVillageChunk));
}

// --- Lookup helpers ---

export function getFullAddress(villageOrCode: Village | string): {
  village?: Village;
  commune?: Commune;
  district?: District;
  province?: Province;
} {
  const code =
    typeof villageOrCode === "string" ? villageOrCode : villageOrCode.code;

  const provinceCode = code.substring(0, 2);
  const districtCode = code.substring(0, 4);
  const communeCode = code.substring(0, 6);

  return {
    province: provinces[provinceCode],
    district: districts[districtCode],
    commune: communes[communeCode],
  };
}

export { provinces, districts, communes };

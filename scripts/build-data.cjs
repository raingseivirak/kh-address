const fs = require("fs");
const path = require("path");
const YAML = require("yaml");

const RAW_DIR = path.join(__dirname, "..");
const OUT_DIR = path.join(__dirname, "..", "src", "data");

function readYaml(filename, key) {
  const content = fs.readFileSync(path.join(RAW_DIR, filename), "utf-8");
  const parsed = YAML.parse(content);
  return parsed[key];
}

const rawProvinces = readYaml("raw_provinces.yml", "provinces");
const rawDistricts = readYaml("raw_districts.yml", "districts");
const rawCommunes = readYaml("raw_communes.yml", "communes");
const rawVillages = readYaml("raw_villages.yml", "villages");

function parseGeo(geodata) {
  if (!geodata) return null;
  return {
    lat: parseFloat(geodata.lat),
    lng: parseFloat(geodata.long),
  };
}

// --- Provinces ---
const provinces = {};
for (const [code, data] of Object.entries(rawProvinces)) {
  provinces[code] = {
    code,
    nameKm: data.name.km,
    nameEn: data.name.latin,
    nameUngegn: data.name.ungegn || null,
    administrativeUnit: {
      nameKm: data.administrative_unit.km,
      nameEn: data.administrative_unit.en,
      nameLatin: data.administrative_unit.latin,
    },
    iso3166: data.iso3166_2 || null,
    geodata: parseGeo(data.geodata),
  };
}

// --- Districts ---
const districts = {};
for (const [code, data] of Object.entries(rawDistricts)) {
  const provinceCode = code.substring(0, 2);
  districts[code] = {
    code,
    provinceCode,
    nameKm: data.name.km,
    nameEn: data.name.latin,
    nameUngegn: data.name.ungegn || null,
    administrativeUnit: {
      nameKm: data.administrative_unit.km,
      nameEn: data.administrative_unit.en,
      nameLatin: data.administrative_unit.latin,
    },
    geodata: parseGeo(data.geodata),
  };
}

// --- Communes ---
const communes = {};
for (const [code, data] of Object.entries(rawCommunes)) {
  const provinceCode = code.substring(0, 2);
  const districtCode = code.substring(0, 4);
  communes[code] = {
    code,
    districtCode,
    provinceCode,
    nameKm: data.name.km,
    nameEn: data.name.latin,
    nameUngegn: data.name.ungegn || null,
    administrativeUnit: {
      nameKm: data.administrative_unit.km,
      nameEn: data.administrative_unit.en,
      nameLatin: data.administrative_unit.latin,
    },
    geodata: parseGeo(data.geodata),
  };
}

// --- Villages ---
const villages = {};
for (const [code, data] of Object.entries(rawVillages)) {
  const provinceCode = code.substring(0, 2);
  const districtCode = code.substring(0, 4);
  const communeCode = code.substring(0, 6);
  villages[code] = {
    code,
    communeCode,
    districtCode,
    provinceCode,
    nameKm: data.name.km,
    nameEn: data.name.latin,
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });

function writeJson(filename, data) {
  const filepath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data), "utf-8");
  const count = Array.isArray(data) ? data.length : Object.keys(data).length;
  const sizeKb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(1);
  console.log(`  ${filename}: ${count} entries (${sizeKb} KB)`);
}

console.log("Building cambodia-address data...\n");
writeJson("provinces.json", provinces);
writeJson("districts.json", districts);
writeJson("communes.json", communes);
writeJson("villages.json", villages);

// --- Build a flat search index for fast autocomplete ---
// Includes provinces, districts, communes (not villages — too many for in-memory search)
const searchIndex = [];

for (const p of Object.values(provinces)) {
  searchIndex.push({
    t: "province",
    c: p.code,
    en: p.nameEn,
    km: p.nameKm,
  });
}

for (const d of Object.values(districts)) {
  searchIndex.push({
    t: "district",
    c: d.code,
    en: d.nameEn,
    km: d.nameKm,
    pc: d.provinceCode,
  });
}

for (const c of Object.values(communes)) {
  searchIndex.push({
    t: "commune",
    c: c.code,
    en: c.nameEn,
    km: c.nameKm,
    dc: c.districtCode,
    pc: c.provinceCode,
  });
}

writeJson("search-index.json", searchIndex);

// --- Summary ---
console.log("\nSummary:");
console.log(`  Provinces: ${Object.keys(provinces).length}`);
console.log(`  Districts: ${Object.keys(districts).length}`);
console.log(`  Communes:  ${Object.keys(communes).length}`);
console.log(`  Villages:  ${Object.keys(villages).length}`);
console.log(`  Search index: ${searchIndex.length} entries (provinces + districts + communes)`);
console.log("\nDone! Data written to src/data/");

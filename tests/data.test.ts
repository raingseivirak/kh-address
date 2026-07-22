import { describe, it, expect } from "vitest";
import {
  getProvinces,
  getProvinceByCode,
  getDistricts,
  getDistrictByCode,
  getCommunes,
  getCommunesByProvince,
  getCommuneByCode,
  getVillages,
  getVillagesByDistrict,
  getVillagesByProvince,
  getVillageByCode,
  getFullAddress,
  preload,
} from "../src/index.js";

describe("Provinces", () => {
  it("returns all 25 provinces", () => {
    const provinces = getProvinces();
    expect(provinces.length).toBe(25);
  });

  it("finds Phnom Penh by code", () => {
    const pp = getProvinceByCode("12");
    expect(pp).toBeDefined();
    expect(pp!.nameEn).toBe("Phnom Penh");
    expect(pp!.nameKm).toBe("ភ្នំពេញ");
    expect(pp!.administrativeUnit.nameEn).toBe("Capital");
    expect(pp!.iso3166).toBe("KH-12");
    expect(pp!.geodata).toBeDefined();
    expect(pp!.geodata!.lat).toBeCloseTo(11.573, 1);
  });

  it("finds Siem Reap by code", () => {
    const sr = getProvinceByCode("17");
    expect(sr).toBeDefined();
    expect(sr!.nameEn).toBe("Siem Reap");
    expect(sr!.nameKm).toBe("សៀមរាប");
  });

  it("returns undefined for invalid code", () => {
    expect(getProvinceByCode("99")).toBeUndefined();
  });
});

describe("Districts", () => {
  it("returns all districts", () => {
    const all = getDistricts();
    expect(all.length).toBeGreaterThan(190);
  });

  it("filters by province code", () => {
    const ppDistricts = getDistricts("12");
    expect(ppDistricts.length).toBe(14);
    ppDistricts.forEach((d) => expect(d.provinceCode).toBe("12"));
  });

  it("finds Chamkar Mon by code", () => {
    const d = getDistrictByCode("1201");
    expect(d).toBeDefined();
    expect(d!.nameEn).toBe("Chamkar Mon");
    expect(d!.nameKm).toBe("ចំការមន");
    expect(d!.administrativeUnit.nameLatin).toBe("Khan");
  });

  it("finds Sen Sok by code", () => {
    const d = getDistrictByCode("1208");
    expect(d).toBeDefined();
    expect(d!.nameEn).toBe("Sen Sok");
    expect(d!.nameKm).toBe("សែនសុខ");
  });
});

describe("Communes", () => {
  it("returns all communes", () => {
    const all = getCommunes();
    expect(all.length).toBeGreaterThan(1600);
  });

  it("filters by district code", () => {
    const chamkarMonCommunes = getCommunes("1201");
    expect(chamkarMonCommunes.length).toBeGreaterThan(0);
    chamkarMonCommunes.forEach((c) => expect(c.districtCode).toBe("1201"));
  });

  it("filters by province code", () => {
    const ppCommunes = getCommunesByProvince("12");
    expect(ppCommunes.length).toBeGreaterThan(50);
    ppCommunes.forEach((c) => expect(c.provinceCode).toBe("12"));
  });

  it("finds Tonle Basak by code", () => {
    const c = getCommuneByCode("120101");
    expect(c).toBeDefined();
    expect(c!.nameEn).toBe("Tonle Basak");
    expect(c!.nameKm).toBe("ទន្លេបាសាក់");
    expect(c!.administrativeUnit.nameLatin).toBe("Sangkat");
  });
});

describe("Villages (lazy loaded)", () => {
  it("loads villages for a commune", async () => {
    const villages = await getVillages("120101");
    expect(villages.length).toBeGreaterThan(0);
    villages.forEach((v) => expect(v.communeCode).toBe("120101"));
  });

  it("loads villages by district", async () => {
    const villages = await getVillagesByDistrict("1201");
    expect(villages.length).toBeGreaterThan(0);
    villages.forEach((v) => expect(v.districtCode).toBe("1201"));
  });

  it("loads villages by province", async () => {
    const villages = await getVillagesByProvince("23");
    expect(villages.length).toBe(18);
    villages.forEach((v) => expect(v.provinceCode).toBe("23"));
  });

  it("finds a specific village by code", async () => {
    const v = await getVillageByCode("12010101");
    expect(v).toBeDefined();
    expect(v!.nameKm).toBe("ភូមិ ១");
    expect(v!.nameEn).toBe("Phum 1");
    expect(v!.communeCode).toBe("120101");
  });

  it("returns undefined for invalid village code", async () => {
    const v = await getVillageByCode("99999999");
    expect(v).toBeUndefined();
  });

  it("preloads villages for a province", async () => {
    await preload("12");
    const v = await getVillageByCode("12010101");
    expect(v).toBeDefined();
  });
});

describe("getFullAddress", () => {
  it("resolves hierarchy from a code", () => {
    const addr = getFullAddress("12010101");
    expect(addr.province?.nameEn).toBe("Phnom Penh");
    expect(addr.district?.nameEn).toBe("Chamkar Mon");
    expect(addr.commune?.nameEn).toBe("Tonle Basak");
  });
});

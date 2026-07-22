import { describe, it, expect } from "vitest";
import {
  getProvinces,
  getProvinceByCode,
  getDistricts,
  getDistrictByCode,
  getCommunes,
  getCommunesByProvince,
  getCommuneByCode,
  getFullAddress,
} from "../src/index.js";
import {
  getVillages,
  getVillagesByDistrict,
  getVillagesByProvince,
  getVillageByCode,
  getFullAddressWithVillage,
} from "../src/villages.js";

describe("Provinces", () => {
  it("returns all 25 provinces", () => {
    expect(getProvinces().length).toBe(25);
  });

  it("finds Phnom Penh by code", () => {
    const pp = getProvinceByCode("12");
    expect(pp).toBeDefined();
    expect(pp!.nameEn).toBe("Phnom Penh");
    expect(pp!.nameKm).toBe("ភ្នំពេញ");
    expect(pp!.administrativeUnit.nameEn).toBe("Capital");
    expect(pp!.iso3166).toBe("KH-12");
    expect(pp!.geodata!.lat).toBeCloseTo(11.573, 1);
  });

  it("finds Siem Reap by code", () => {
    const sr = getProvinceByCode("17");
    expect(sr!.nameEn).toBe("Siem Reap");
    expect(sr!.nameKm).toBe("សៀមរាប");
  });

  it("returns undefined for invalid code", () => {
    expect(getProvinceByCode("99")).toBeUndefined();
  });
});

describe("Districts", () => {
  it("returns all districts", () => {
    expect(getDistricts().length).toBe(210);
  });

  it("filters by province code", () => {
    const ppDistricts = getDistricts("12");
    expect(ppDistricts.length).toBe(14);
    ppDistricts.forEach((d) => expect(d.provinceCode).toBe("12"));
  });

  it("finds Chamkar Mon", () => {
    const d = getDistrictByCode("1201");
    expect(d!.nameEn).toBe("Chamkar Mon");
    expect(d!.nameKm).toBe("ចំការមន");
    expect(d!.administrativeUnit.nameLatin).toBe("Khan");
  });
});

describe("Communes", () => {
  it("returns all communes", () => {
    expect(getCommunes().length).toBe(1652);
  });

  it("filters by district code", () => {
    const c = getCommunes("1201");
    expect(c.length).toBeGreaterThan(0);
    c.forEach((c) => expect(c.districtCode).toBe("1201"));
  });

  it("filters by province code", () => {
    const c = getCommunesByProvince("12");
    expect(c.length).toBeGreaterThan(50);
    c.forEach((c) => expect(c.provinceCode).toBe("12"));
  });

  it("finds Tonle Basak", () => {
    const c = getCommuneByCode("120101");
    expect(c!.nameEn).toBe("Tonle Basak");
    expect(c!.nameKm).toBe("ទន្លេបាសាក់");
  });
});

describe("Villages (separate import)", () => {
  it("loads villages for a commune", () => {
    const v = getVillages("120101");
    expect(v.length).toBeGreaterThan(0);
    v.forEach((v) => expect(v.communeCode).toBe("120101"));
  });

  it("loads villages by district", () => {
    const v = getVillagesByDistrict("1201");
    expect(v.length).toBeGreaterThan(0);
    v.forEach((v) => expect(v.districtCode).toBe("1201"));
  });

  it("loads villages by province", () => {
    const v = getVillagesByProvince("23");
    expect(v.length).toBe(18);
  });

  it("finds a specific village", () => {
    const v = getVillageByCode("12010101");
    expect(v!.nameKm).toBe("ភូមិ ១");
    expect(v!.nameEn).toBe("Phum 1");
  });

  it("returns undefined for invalid code", () => {
    expect(getVillageByCode("99999999")).toBeUndefined();
  });
});

describe("getFullAddress", () => {
  it("resolves hierarchy from code", () => {
    const addr = getFullAddress("12010101");
    expect(addr.province?.nameEn).toBe("Phnom Penh");
    expect(addr.district?.nameEn).toBe("Chamkar Mon");
    expect(addr.commune?.nameEn).toBe("Tonle Basak");
  });
});

describe("getFullAddressWithVillage", () => {
  it("resolves full hierarchy including village", () => {
    const addr = getFullAddressWithVillage("12010101");
    expect(addr.province?.nameEn).toBe("Phnom Penh");
    expect(addr.district?.nameEn).toBe("Chamkar Mon");
    expect(addr.commune?.nameEn).toBe("Tonle Basak");
    expect(addr.village?.nameEn).toBe("Phum 1");
  });
});

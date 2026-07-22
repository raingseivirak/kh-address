import { describe, it, expect } from "vitest";
import { searchAddress } from "../src/index.js";

describe("searchAddress", () => {
  it("finds province by English name", () => {
    const results = searchAddress("Phnom Penh");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameEn).toBe("Phnom Penh");
    expect(results[0].type).toBe("province");
  });

  it("finds province by Khmer name", () => {
    const results = searchAddress("ភ្នំពេញ");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].nameKm).toBe("ភ្នំពេញ");
  });

  it("finds district by partial English name", () => {
    const results = searchAddress("Sen Sok");
    expect(results.length).toBeGreaterThan(0);
    const senSok = results.find(
      (r) => r.nameEn === "Sen Sok" && r.type === "district"
    );
    expect(senSok).toBeDefined();
  });

  it("finds district by Khmer name", () => {
    const results = searchAddress("សែនសុខ");
    expect(results.length).toBeGreaterThan(0);
    const senSok = results.find((r) => r.nameKm === "សែនសុខ");
    expect(senSok).toBeDefined();
  });

  it("finds commune with parent context", () => {
    const results = searchAddress("Tonle Basak");
    expect(results.length).toBeGreaterThan(0);
    const tb = results.find((r) => r.type === "commune");
    expect(tb).toBeDefined();
    expect(tb!.province).toBeDefined();
    expect(tb!.province!.nameEn).toBe("Phnom Penh");
  });

  it("respects limit option", () => {
    const results = searchAddress("K", { limit: 5 });
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("filters by type", () => {
    const results = searchAddress("Phnom Penh", { type: "district" });
    results.forEach((r) => expect(r.type).toBe("district"));
  });

  it("filters by province code", () => {
    const results = searchAddress("S", { provinceCode: "12" });
    results.forEach((r) => {
      if (r.province) expect(r.province.code).toBe("12");
    });
  });

  it("returns empty for empty query", () => {
    expect(searchAddress("")).toEqual([]);
    expect(searchAddress("   ")).toEqual([]);
  });

  it("ranks exact match higher than substring", () => {
    const results = searchAddress("Kep");
    const exactProvince = results.find(
      (r) => r.nameEn === "Kep" && r.type === "province"
    );
    expect(exactProvince).toBeDefined();
    expect(results[0].code).toBe(exactProvince!.code);
  });
});

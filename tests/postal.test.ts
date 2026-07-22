import { describe, it, expect } from "vitest";
import { getPostalCode, lookupByPostalCode } from "../src/index.js";

describe("getPostalCode", () => {
  it("returns postal code for province", () => {
    expect(getPostalCode("12")).toBe("120000");
    expect(getPostalCode("01")).toBe("010000");
    expect(getPostalCode("17")).toBe("170000");
  });

  it("returns postal code for district", () => {
    expect(getPostalCode("1201")).toBe("120100");
    expect(getPostalCode("0102")).toBe("010200");
  });

  it("returns postal code for commune (matching admin code)", () => {
    expect(getPostalCode("010201")).toBe("010201");
  });

  it("returns postal code for commune (NOT matching admin code)", () => {
    // Phnom Penh mismatches from Prakas No.77
    expect(getPostalCode("120901")).toBe("120913");
    expect(getPostalCode("121001")).toBe("121102");
    expect(getPostalCode("121201")).toBe("121002");
  });

  it("returns postal code for village (using commune postal prefix)", () => {
    // Commune 120901 has postal 120913, so village 12090101 → 12091301
    expect(getPostalCode("12090101")).toBe("12091301");
    // Commune 120101 has postal 120101 (matching), so village stays same
    expect(getPostalCode("12010101")).toBe("12010101");
  });

  it("returns undefined for invalid code", () => {
    expect(getPostalCode("99")).toBeUndefined();
    expect(getPostalCode("9999")).toBeUndefined();
  });
});

describe("lookupByPostalCode", () => {
  it("looks up province by postal code", () => {
    const result = lookupByPostalCode("120000");
    expect(result.provinceCode).toBe("12");
  });

  it("looks up district by postal code", () => {
    const result = lookupByPostalCode("120100");
    expect(result.provinceCode).toBe("12");
    expect(result.districtCode).toBe("1201");
  });

  it("looks up commune by postal code (matching)", () => {
    const result = lookupByPostalCode("010201");
    expect(result.provinceCode).toBe("01");
    expect(result.districtCode).toBe("0102");
    expect(result.communeCode).toBe("010201");
  });

  it("looks up commune by postal code (mismatched)", () => {
    // Postal 120913 → admin code 120901 (Sangkat Trapeang Krasang)
    const result = lookupByPostalCode("120913");
    expect(result.provinceCode).toBe("12");
    expect(result.communeCode).toBe("120901");
  });

  it("returns empty for invalid postal code", () => {
    const result = lookupByPostalCode("990000");
    expect(result.provinceCode).toBeUndefined();
  });
});

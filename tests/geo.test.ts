import { describe, it, expect } from "vitest";
import {
  getCoordinates,
  findNearest,
  findNearestAddress,
} from "../src/geo.js";

describe("getCoordinates", () => {
  it("returns coordinates for province", () => {
    const geo = getCoordinates("12");
    expect(geo).toBeDefined();
    expect(geo!.lat).toBeCloseTo(11.573, 1);
    expect(geo!.lng).toBeCloseTo(104.858, 1);
  });

  it("returns coordinates for district", () => {
    const geo = getCoordinates("1201");
    expect(geo).toBeDefined();
    expect(geo!.lat).toBeCloseTo(11.537, 1);
  });

  it("returns coordinates for commune", () => {
    const geo = getCoordinates("120101");
    expect(geo).toBeDefined();
    expect(geo!.lat).toBeCloseTo(11.551, 1);
  });

  it("returns commune coordinates for village code", () => {
    const geo = getCoordinates("12010101");
    expect(geo).toBeDefined();
  });

  it("returns undefined for invalid code", () => {
    expect(getCoordinates("99")).toBeUndefined();
  });
});

describe("findNearest", () => {
  it("finds nearest communes to Phnom Penh center", () => {
    const results = findNearest(11.556, 104.928, { limit: 3 });
    expect(results.length).toBe(3);
    expect(results[0].distanceKm).toBeLessThan(results[1].distanceKm);
    expect(results[0].type).toBe("commune");
  });

  it("finds nearest provinces", () => {
    const results = findNearest(11.556, 104.928, { type: "province", limit: 3 });
    expect(results.length).toBe(3);
    expect(results[0].type).toBe("province");
    expect(results[0].nameEn).toBe("Phnom Penh");
  });

  it("finds nearest districts", () => {
    const results = findNearest(13.36, 103.86, { type: "district", limit: 1 });
    expect(results.length).toBe(1);
    expect(results[0].type).toBe("district");
  });
});

describe("findNearestAddress", () => {
  it("resolves full address from Phnom Penh coordinates", () => {
    const result = findNearestAddress(11.556, 104.928);
    expect(result).toBeDefined();
    expect(result!.province.nameEn).toBe("Phnom Penh");
    expect(result!.district).toBeDefined();
    expect(result!.commune).toBeDefined();
    expect(result!.distanceKm).toBeLessThan(5);
  });

  it("resolves Siem Reap area", () => {
    const result = findNearestAddress(13.36, 103.86);
    expect(result).toBeDefined();
    expect(result!.province.nameEn).toBe("Siem Reap");
  });

  it("resolves Battambang area", () => {
    const result = findNearestAddress(13.1, 103.2);
    expect(result).toBeDefined();
    expect(result!.province.nameEn).toBe("Battambang");
  });
});

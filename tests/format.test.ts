import { describe, it, expect } from "vitest";
import {
  formatAddress,
  formatAddressFromCode,
  formatFullAddressFromCode,
  parseAddress,
  getProvinceByCode,
  getDistrictByCode,
  getCommuneByCode,
} from "../src/index.js";

describe("formatAddress", () => {
  it("formats structured address in English", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
    };
    const result = formatAddress(address, "en");
    expect(result).toBe("Tonle Basak, Chamkar Mon, Phnom Penh");
  });

  it("formats structured address in Khmer", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
    };
    const result = formatAddress(address, "km");
    expect(result).toBe("ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ");
  });

  it("handles partial address", () => {
    const address = {
      province: getProvinceByCode("12")!,
    };
    const result = formatAddress(address, "en");
    expect(result).toBe("Phnom Penh");
  });
});

describe("formatAddressFromCode", () => {
  it("formats from province code", () => {
    expect(formatAddressFromCode("12", "en")).toBe("Phnom Penh");
  });

  it("formats from district code", () => {
    expect(formatAddressFromCode("1201", "en")).toBe("Chamkar Mon, Phnom Penh");
  });

  it("formats from commune code", () => {
    expect(formatAddressFromCode("120101", "en")).toBe(
      "Tonle Basak, Chamkar Mon, Phnom Penh"
    );
  });

  it("formats in Khmer", () => {
    expect(formatAddressFromCode("1201", "km")).toBe("ចំការមន, ភ្នំពេញ");
  });
});

describe("formatFullAddressFromCode", () => {
  it("formats full address including village", async () => {
    const result = await formatFullAddressFromCode("12010101", "en");
    expect(result).toBe("Phum 1, Tonle Basak, Chamkar Mon, Phnom Penh");
  });

  it("formats full address in Khmer", async () => {
    const result = await formatFullAddressFromCode("12010101", "km");
    expect(result).toBe("ភូមិ ១, ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ");
  });
});

describe("parseAddress", () => {
  it("parses English address string", () => {
    const result = parseAddress("Tonle Basak, Chamkar Mon, Phnom Penh");
    expect(result.provinceCode).toBe("12");
    expect(result.districtCode).toBe("1201");
    expect(result.communeCode).toBe("120101");
  });

  it("parses province-only string", () => {
    const result = parseAddress("Siem Reap");
    expect(result.provinceCode).toBe("17");
  });

  it("parses Khmer address", () => {
    const result = parseAddress("ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ");
    expect(result.provinceCode).toBe("12");
    expect(result.districtCode).toBe("1201");
    expect(result.communeCode).toBe("120101");
  });

  it("returns empty for empty input", () => {
    const result = parseAddress("");
    expect(result).toEqual({});
  });
});

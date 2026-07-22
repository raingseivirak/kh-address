import { describe, it, expect } from "vitest";
import {
  formatAddress,
  formatAddressFromCode,
  parseAddress,
  getProvinceByCode,
  getDistrictByCode,
  getCommuneByCode,
} from "../src/index.js";

describe("formatAddress — formal (default)", () => {
  it("formats Phnom Penh address in English with unit prefixes", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
    };
    expect(formatAddress(address)).toBe(
      "Sangkat Tonle Basak, Khan Chamkar Mon, Phnom Penh"
    );
  });

  it("formats Phnom Penh address in Khmer with unit prefixes", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
    };
    expect(formatAddress(address, "km")).toBe(
      "សង្កាត់ទន្លេបាសាក់ ខណ្ឌចំការមន ភ្នំពេញ"
    );
  });

  it("formats rural address with Srok/Khum/Khaet", () => {
    const address = {
      province: getProvinceByCode("17")!,
      district: getDistrictByCode("1701")!,
      commune: getCommuneByCode("170101")!,
    };
    const en = formatAddress(address);
    expect(en).toContain("Srok");
    expect(en).toContain("Khum");
    expect(en).toContain("Siem Reap");
  });

  it("formats rural address in Khmer", () => {
    const address = {
      province: getProvinceByCode("17")!,
      district: getDistrictByCode("1701")!,
      commune: getCommuneByCode("170101")!,
    };
    const km = formatAddress(address, "km");
    expect(km).toContain("ស្រុក");
    expect(km).toContain("ឃុំ");
    expect(km).toContain("សៀមរាប");
  });

  it("includes house and street number in English", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
      houseNumber: "123",
      streetNumber: "271",
    };
    expect(formatAddress(address)).toBe(
      "#123, Street 271, Sangkat Tonle Basak, Khan Chamkar Mon, Phnom Penh"
    );
  });

  it("includes house and street number in Khmer", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
      houseNumber: "123",
      streetNumber: "271",
    };
    expect(formatAddress(address, "km")).toBe(
      "ផ្ទះលេខ 123 ផ្លូវលេខ 271 សង្កាត់ទន្លេបាសាក់ ខណ្ឌចំការមន ភ្នំពេញ"
    );
  });

  it("includes group number", () => {
    const address = {
      province: getProvinceByCode("17")!,
      groupNumber: "5",
    };
    expect(formatAddress(address)).toBe(
      "Group 5, Siem Reap"
    );
    expect(formatAddress(address, "km")).toBe(
      "ក្រុមទី 5 សៀមរាប"
    );
  });
});

describe("formatAddress — short", () => {
  it("formats without unit prefixes", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
    };
    expect(formatAddress(address, { language: "en", format: "short" })).toBe(
      "Tonle Basak, Chamkar Mon, Phnom Penh"
    );
  });

  it("formats Khmer without unit prefixes", () => {
    const address = {
      province: getProvinceByCode("12")!,
      district: getDistrictByCode("1201")!,
      commune: getCommuneByCode("120101")!,
    };
    expect(formatAddress(address, { language: "km", format: "short" })).toBe(
      "ទន្លេបាសាក់ ចំការមន ភ្នំពេញ"
    );
  });
});

describe("formatAddressFromCode", () => {
  it("formats formal from commune code", () => {
    expect(formatAddressFromCode("120101")).toBe(
      "Sangkat Tonle Basak, Khan Chamkar Mon, Phnom Penh"
    );
  });

  it("formats formal Khmer from commune code", () => {
    expect(formatAddressFromCode("120101", "km")).toBe(
      "សង្កាត់ទន្លេបាសាក់ ខណ្ឌចំការមន ភ្នំពេញ"
    );
  });

  it("formats short from commune code", () => {
    expect(
      formatAddressFromCode("120101", { language: "en", format: "short" })
    ).toBe("Tonle Basak, Chamkar Mon, Phnom Penh");
  });

  it("formats from district code", () => {
    expect(formatAddressFromCode("1201")).toBe(
      "Khan Chamkar Mon, Phnom Penh"
    );
  });

  it("formats from province code", () => {
    expect(formatAddressFromCode("12")).toBe("Phnom Penh");
    expect(formatAddressFromCode("17")).toBe("Siem Reap");
  });
});

describe("parseAddress", () => {
  it("parses English address string", () => {
    const result = parseAddress("Tonle Basak, Chamkar Mon, Phnom Penh");
    expect(result.provinceCode).toBe("12");
    expect(result.districtCode).toBe("1201");
    expect(result.communeCode).toBe("120101");
  });

  it("parses formal English with unit prefixes", () => {
    const result = parseAddress(
      "Sangkat Tonle Basak, Khan Chamkar Mon, Phnom Penh"
    );
    expect(result.provinceCode).toBe("12");
    expect(result.districtCode).toBe("1201");
    expect(result.communeCode).toBe("120101");
  });

  it("parses Khmer with prefixes", () => {
    const result = parseAddress("សង្កាត់ទន្លេបាសាក់ ខណ្ឌចំការមន ភ្នំពេញ");
    expect(result.provinceCode).toBe("12");
    expect(result.districtCode).toBe("1201");
    expect(result.communeCode).toBe("120101");
  });

  it("parses province-only", () => {
    expect(parseAddress("Siem Reap").provinceCode).toBe("17");
  });

  it("returns empty for empty input", () => {
    expect(parseAddress("")).toEqual({});
  });
});

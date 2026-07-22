import postalData from "./data/postal-codes.json";

const { adminToPostal, postalToAdmin } = postalData as {
  adminToPostal: Record<string, string>;
  postalToAdmin: Record<string, string>;
};

export function getPostalCode(adminCode: string): string | undefined {
  if (adminCode.length <= 6) {
    return adminToPostal[adminCode];
  }

  // Village: commune postal prefix (6 digits) + village suffix (last 2 digits)
  const communeAdminCode = adminCode.substring(0, 6);
  const villageSuffix = adminCode.substring(6, 8);
  const communePostal = adminToPostal[communeAdminCode];
  if (!communePostal) return undefined;
  return communePostal.substring(0, 6) + villageSuffix;
}

export function lookupByPostalCode(
  postalCode: string
): { provinceCode?: string; districtCode?: string; communeCode?: string } {
  const result: {
    provinceCode?: string;
    districtCode?: string;
    communeCode?: string;
  } = {};

  const provincePostal = postalCode.substring(0, 2) + "0000";
  result.provinceCode = postalToAdmin[provincePostal];

  if (postalCode.length >= 4) {
    const districtPostal = postalCode.substring(0, 4) + "00";
    result.districtCode = postalToAdmin[districtPostal];
  }

  if (postalCode.length >= 6) {
    const communePostal = postalCode.substring(0, 6);
    result.communeCode = postalToAdmin[communePostal];
  }

  return result;
}

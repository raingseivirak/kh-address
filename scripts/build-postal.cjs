const fs = require("fs");
const path = require("path");
const OUT_DIR = path.join(__dirname, "..", "src", "data");

function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, "utf-8").replace(/^﻿/, "");
  const lines = content.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (values[i] || "").trim()));
    return obj;
  });
}

const provinces = parseCSV("/tmp/postal_province_en.csv");
const districts = parseCSV("/tmp/postal_district_en.csv").filter(
  (r) => r.dcode && r.postal_code
);
const communes = parseCSV("/tmp/postal_commune_en.csv").filter(
  (r) => r.ccode && r.postal_code
);

const adminToPostal = {};
const postalToAdmin = {};

for (const p of provinces) {
  const adminCode = String(p.pcode).padStart(2, "0");
  adminToPostal[adminCode] = p.postal_code;
  postalToAdmin[p.postal_code] = adminCode;
}

for (const d of districts) {
  const adminCode = String(d.dcode).padStart(4, "0");
  adminToPostal[adminCode] = d.postal_code;
  postalToAdmin[d.postal_code] = adminCode;
}

for (const c of communes) {
  const adminCode = String(c.ccode).padStart(6, "0");
  adminToPostal[adminCode] = c.postal_code;
  postalToAdmin[c.postal_code] = adminCode;
}

const pCount = Object.keys(adminToPostal).filter((k) => k.length === 2).length;
const dCount = Object.keys(adminToPostal).filter((k) => k.length === 4).length;
const cCount = Object.keys(adminToPostal).filter((k) => k.length === 6).length;

console.log("Postal code mapping from Prakas No.77 (Dec 30, 2025)\n");
console.log(`  Provinces: ${pCount}`);
console.log(`  Districts: ${dCount}`);
console.log(`  Communes:  ${cCount}`);
console.log(`  Total:     ${Object.keys(adminToPostal).length}`);

const data = { adminToPostal, postalToAdmin };
const json = JSON.stringify(data);
fs.writeFileSync(path.join(OUT_DIR, "postal-codes.json"), json, "utf-8");
console.log(
  `\n  Written: postal-codes.json (${(Buffer.byteLength(json) / 1024).toFixed(1)} KB)`
);

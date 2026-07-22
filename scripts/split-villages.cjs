const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "src", "data", "villages");
const villages = require(path.join(__dirname, "..", "src", "data", "villages.json"));

fs.mkdirSync(OUT_DIR, { recursive: true });

const byProvince = {};
for (const [code, village] of Object.entries(villages)) {
  const pc = village.provinceCode;
  if (!byProvince[pc]) byProvince[pc] = {};
  byProvince[pc][code] = village;
}

console.log("Splitting villages by province...\n");

let totalEntries = 0;
for (const [provinceCode, data] of Object.entries(byProvince).sort((a, b) => a[0].localeCompare(b[0]))) {
  const filename = `${provinceCode}.json`;
  const filepath = path.join(OUT_DIR, filename);
  const json = JSON.stringify(data);
  fs.writeFileSync(filepath, json, "utf-8");
  const count = Object.keys(data).length;
  totalEntries += count;
  const sizeKb = (Buffer.byteLength(json) / 1024).toFixed(1);
  console.log(`  ${filename}: ${count} villages (${sizeKb} KB)`);
}

console.log(`\nTotal: ${totalEntries} villages across ${Object.keys(byProvince).length} province files`);

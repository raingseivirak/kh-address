# cambodia-address

A practical TypeScript library for Cambodian addresses in English and Khmer. Provides cascading lookups, bilingual autocomplete/search, address formatting, and lazy-loaded village data.

## Features

- **Bilingual** — English and Khmer names for all 16,000+ locations
- **Full hierarchy** — Province → District → Commune → Village
- **Autocomplete/Search** — Substring search in both languages with ranked results
- **Lazy-loaded villages** — Core bundle is ~99 KB gzipped; 14,578 villages load on demand per province
- **Address formatting** — Format structured addresses in English or Khmer
- **Address parsing** — Parse free-text address strings into structured components
- **Geodata** — Latitude/longitude for provinces, districts, and communes
- **TypeScript-first** — Full type definitions, works with any framework
- **Zero runtime dependencies**

## Install

```bash
npm install cambodia-address
```

## Quick Start

```typescript
import {
  getProvinces,
  getDistricts,
  getCommunes,
  getVillages,
  searchAddress,
  formatAddressFromCode,
} from 'cambodia-address';

// Get all 25 provinces
const provinces = getProvinces();

// Get districts in Phnom Penh
const districts = getDistricts('12');

// Get communes in Chamkar Mon district
const communes = getCommunes('1201');

// Get villages in Tonle Basak commune (async - lazy loaded)
const villages = await getVillages('120101');

// Search in English or Khmer
const results = searchAddress('សែនសុខ');
// → [{ type: 'district', nameEn: 'Sen Sok', nameKm: 'សែនសុខ', province: { nameEn: 'Phnom Penh' }, ... }]

// Format address from code
formatAddressFromCode('120101', 'en');  // → "Tonle Basak, Chamkar Mon, Phnom Penh"
formatAddressFromCode('120101', 'km');  // → "ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ"
```

## Data

| Level | Count | Sync/Async | Bundle Impact |
|-------|-------|------------|---------------|
| Provinces | 25 | Sync | Included (~6 KB) |
| Districts | 210 | Sync | Included (~47 KB) |
| Communes | 1,652 | Sync | Included (~394 KB) |
| Villages | 14,578 | **Async** | Lazy per province (2-206 KB each) |
| **Core bundle** | | | **~99 KB gzipped** |

Administrative unit types:
- Province: Province (ខេត្ត), Capital (រាជធានី)
- District: District (ស្រុក), Municipality (ក្រុង), Section/Khan (ខណ្ឌ)
- Commune: Commune (ឃុំ), Quarter/Sangkat (សង្កាត់)
- Village: Village (ភូមិ)

Data source: [pumi](https://github.com/dwilkie/pumi) — official NCDDS gazetteer data.

## API Reference

### Provinces (sync)

```typescript
getProvinces(): Province[]
getProvinceByCode(code: string): Province | undefined
```

### Districts (sync)

```typescript
getDistricts(provinceCode?: string): District[]
getDistrictByCode(code: string): District | undefined
```

### Communes (sync)

```typescript
getCommunes(districtCode?: string): Commune[]
getCommunesByProvince(provinceCode: string): Commune[]
getCommuneByCode(code: string): Commune | undefined
```

### Villages (async — lazy loaded)

```typescript
getVillages(communeCode?: string): Promise<Village[]>
getVillagesByDistrict(districtCode: string): Promise<Village[]>
getVillagesByProvince(provinceCode: string): Promise<Village[]>
getVillageByCode(code: string): Promise<Village | undefined>
```

### Search / Autocomplete

```typescript
searchAddress(query: string, options?: SearchOptions): SearchResult[]
```

Search across provinces, districts, and communes in both English and Khmer. Results are ranked: exact match > prefix match > substring match.

```typescript
interface SearchOptions {
  limit?: number;           // Max results (default: 10)
  type?: 'province' | 'district' | 'commune';  // Filter by level
  provinceCode?: string;    // Filter within a province
}
```

### Formatting

```typescript
// Format structured address object
formatAddress(address: StructuredAddress, language?: 'en' | 'km'): string

// Format from an admin code (province, district, or commune code)
formatAddressFromCode(code: string, language?: 'en' | 'km'): string

// Format full address including village (async)
formatFullAddressFromCode(villageCode: string, language?: 'en' | 'km'): Promise<string>
```

### Parsing

```typescript
parseAddress(input: string): { provinceCode?: string; districtCode?: string; communeCode?: string }
```

Parse a comma-separated address string (English or Khmer) into administrative codes.

```typescript
parseAddress('Tonle Basak, Chamkar Mon, Phnom Penh');
// → { provinceCode: '12', districtCode: '1201', communeCode: '120101' }

parseAddress('ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ');
// → { provinceCode: '12', districtCode: '1201', communeCode: '120101' }
```

### Preloading

```typescript
// Preload village data for a province (cached for subsequent calls)
preload(provinceCode: string): Promise<void>

// Preload all village data (useful for server-side)
preloadAll(): Promise<void>
```

### Hierarchy Lookup

```typescript
getFullAddress(code: string): { province?: Province; district?: District; commune?: Commune }
```

Resolve the full hierarchy from any admin code.

### Custom Village Loader

For browser environments or custom setups, provide your own loader:

```typescript
import { setVillageLoader } from 'cambodia-address';

// Example: load from CDN
setVillageLoader(async (provinceCode) => {
  const res = await fetch(`https://cdn.example.com/villages/${provinceCode}.json`);
  return res.json();
});
```

## Usage Examples

### Cascading Address Form

```typescript
import { getProvinces, getDistricts, getCommunes, getVillages } from 'cambodia-address';

// Step 1: User selects province
const provinces = getProvinces();

// Step 2: User selects district
const districts = getDistricts(selectedProvinceCode);

// Step 3: User selects commune
const communes = getCommunes(selectedDistrictCode);

// Step 4: User selects village (loads on demand)
const villages = await getVillages(selectedCommuneCode);
```

### Autocomplete Input

```typescript
import { searchAddress } from 'cambodia-address';

function onInputChange(query: string) {
  const results = searchAddress(query, { limit: 5 });
  // Display results — each has nameEn, nameKm, type, and parent context
  results.forEach(r => {
    console.log(`${r.nameEn} (${r.nameKm}) — ${r.type}`);
    if (r.province) console.log(`  in ${r.province.nameEn}`);
  });
}
```

## Types

```typescript
interface Province {
  code: string;
  nameKm: string;
  nameEn: string;
  nameUngegn: string | null;
  administrativeUnit: AdministrativeUnit;
  iso3166: string | null;       // e.g. "KH-12"
  geodata: GeoData | null;      // { lat, lng }
}

interface District {
  code: string;
  provinceCode: string;
  nameKm: string;
  nameEn: string;
  administrativeUnit: AdministrativeUnit;
  geodata: GeoData | null;
}

interface Commune {
  code: string;
  districtCode: string;
  provinceCode: string;
  nameKm: string;
  nameEn: string;
  administrativeUnit: AdministrativeUnit;
  geodata: GeoData | null;
}

interface Village {
  code: string;
  communeCode: string;
  districtCode: string;
  provinceCode: string;
  nameKm: string;
  nameEn: string;
}

interface SearchResult {
  type: 'province' | 'district' | 'commune';
  code: string;
  nameEn: string;
  nameKm: string;
  score: number;
  province?: { code: string; nameEn: string; nameKm: string };
  district?: { code: string; nameEn: string; nameKm: string };
}
```

## License

MIT

# kh-address

A practical TypeScript library for Cambodian addresses in English and Khmer. Bilingual autocomplete, postal codes (Prakas No.77), cascading lookups, and lightweight lazy-loaded village data.

**[Live Demo](https://raingseivirak.github.io/kh-address/)**

## Features

- **Bilingual** — English and Khmer names for all 16,000+ locations
- **Full hierarchy** — Province → District → Commune → Village
- **Postal codes** — Official Prakas No.77 (Dec 2025) mapping, handles all 43 admin≠postal mismatches
- **Autocomplete/Search** — Substring search in both languages with ranked results
- **React component** — Drop-in `<AddressAutocomplete>` + headless `useAddressAutocomplete` hook
- **Web Component** — Framework-agnostic `<kh-address-input>` custom element
- **Lightweight core** — ~116 KB gzipped (provinces + districts + communes + search + postal)
- **Lazy-loaded villages** — 14,578 villages in a separate import (~367 KB gzipped), only loaded when needed
- **Address formatting** — Format structured addresses in English or Khmer
- **Address parsing** — Parse free-text address strings into structured components
- **Geodata** — Latitude/longitude for provinces, districts, and communes
- **TypeScript-first** — Full type definitions, works with any framework
- **Zero runtime dependencies** — Works in Node.js, browser, Next.js, and edge

## Install

```bash
npm install raingseivirak/kh-address
```

## Quick Start

```typescript
import {
  getProvinces,
  getDistricts,
  getCommunes,
  searchAddress,
  formatAddressFromCode,
  getPostalCode,
  lookupByPostalCode,
} from 'kh-address';

// Get all 25 provinces
const provinces = getProvinces();

// Get districts in Phnom Penh
const districts = getDistricts('12');

// Get communes in Chamkar Mon district
const communes = getCommunes('1201');

// Search in English or Khmer
const results = searchAddress('សែនសុខ');
// → [{ type: 'district', nameEn: 'Sen Sok', nameKm: 'សែនសុខ', ... }]

// Format address
formatAddressFromCode('120101', 'en');  // → "Tonle Basak, Chamkar Mon, Phnom Penh"
formatAddressFromCode('120101', 'km');  // → "ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ"

// Postal codes (official Prakas No.77)
getPostalCode('12');        // → "120000"
getPostalCode('1201');      // → "120100"
getPostalCode('120101');    // → "120101"
getPostalCode('120901');    // → "120913" (admin ≠ postal!)

lookupByPostalCode('120913');
// → { provinceCode: '12', districtCode: '1209', communeCode: '120901' }
```

### Villages (separate import)

Villages are in a separate entry point to keep the core lightweight:

```typescript
import { getVillages, getVillageByCode } from 'kh-address/villages';

const villages = getVillages('120101');     // Villages in Tonle Basak
const village = getVillageByCode('12010101'); // Specific village
```

## UI Components

### React — `AddressAutocomplete`

```tsx
import { AddressAutocomplete } from 'kh-address/react';

// Default styled — works out of the box
<AddressAutocomplete
  language="km"
  placeholder="វាយអាសយដ្ឋាន..."
  onSelect={(address) => {
    console.log(address.provinceCode);  // "12"
    console.log(address.communeCode);   // "120101"
    console.log(address.postalCode);    // "120101"
    console.log(address.formatted.km);  // "ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ"
  }}
/>
```

**Customization options:**

```tsx
// Fully unstyled — bring your own CSS (Tailwind, CSS modules, etc.)
<AddressAutocomplete
  unstyled
  classNames={{
    root: 'relative w-full',
    input: 'w-full px-3 py-2 border rounded-md',
    dropdown: 'absolute mt-1 bg-white shadow-lg rounded-md',
    item: 'px-3 py-2 cursor-pointer',
    itemActive: 'bg-blue-50',
    itemName: 'font-medium',
    itemParent: 'text-sm text-gray-500',
  }}
  onSelect={handleSelect}
/>

// Custom render function for each suggestion
<AddressAutocomplete
  renderItem={(result, isActive, language) => (
    <div className={isActive ? 'bg-blue-50' : ''}>
      <strong>{result.nameKm}</strong>
      <small>{result.province?.nameKm}</small>
    </div>
  )}
  onSelect={handleSelect}
/>
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `language` | `'en' \| 'km'` | Display language (default: `'en'`) |
| `onSelect` | `(selection: AddressSelection) => void` | Called when user selects an address |
| `onChange` | `(query: string) => void` | Called on input change |
| `placeholder` | `string` | Input placeholder |
| `maxResults` | `number` | Max suggestions (default: `8`) |
| `minChars` | `number` | Min chars before searching (default: `1`) |
| `debounceMs` | `number` | Debounce delay in ms (default: `150`) |
| `filterType` | `'province' \| 'district' \| 'commune'` | Only show this type |
| `filterProvinceCode` | `string` | Only show results in this province |
| `unstyled` | `boolean` | Remove all default styles |
| `classNames` | `AddressAutocompleteClassNames` | CSS class overrides |
| `renderItem` | `(result, isActive, language) => ReactNode` | Custom item renderer |
| `noResultsText` | `string` | Custom "no results" message |

### React — `useAddressAutocomplete` hook

For full control over the UI:

```tsx
import { useAddressAutocomplete } from 'kh-address/react';

function MyAddressInput() {
  const {
    inputProps,
    listProps,
    getItemProps,
    results,
    isOpen,
    activeIndex,
    selection,
    clear,
  } = useAddressAutocomplete({ language: 'km', maxResults: 5 });

  return (
    <div>
      <input {...inputProps} className="my-input" />
      {isOpen && (
        <ul {...listProps}>
          {results.map((r, i) => (
            <li key={r.code} {...getItemProps(i)}>
              {r.nameKm}
            </li>
          ))}
        </ul>
      )}
      {selection && <p>Selected: {selection.formatted.km}</p>}
    </div>
  );
}
```

### Web Component — `<kh-address-input>`

Framework-agnostic, works in plain HTML, Vue, Svelte, Angular, etc.

```html
<script type="module">
  import { register } from 'kh-address/web-component';
  register(); // registers <kh-address-input>
</script>

<kh-address-input language="km" placeholder="វាយអាសយដ្ឋាន..."></kh-address-input>

<script>
  document.querySelector('kh-address-input')
    .addEventListener('address-select', (e) => {
      console.log(e.detail.communeCode);   // "120101"
      console.log(e.detail.postalCode);    // "120101"
      console.log(e.detail.formatted.km);  // "ទន្លេបាសាក់, ចំការមន, ភ្នំពេញ"
    });
</script>
```

**Attributes:** `language`, `placeholder`, `max-results`, `value`
**Event:** `address-select` — fires with structured `AddressSelection` in `event.detail`

### `AddressSelection` (returned by all UI components)

```typescript
interface AddressSelection {
  type: 'province' | 'district' | 'commune';
  code: string;
  nameEn: string;
  nameKm: string;
  provinceCode?: string;
  districtCode?: string;
  communeCode?: string;
  postalCode?: string;
  formatted: { en: string; km: string };
}
```

## Bundle Size

| Import | Raw | Gzipped | Contents |
|--------|-----|---------|----------|
| `kh-address` | 866 KB | **116 KB** | Core data + search + postal + format |
| `kh-address/react` | 872 KB | **117 KB** | + React component & hook (React external) |
| `kh-address/web-component` | 870 KB | **117 KB** | + Web Component |
| `kh-address/villages` | 3 MB | **367 KB** | 14,578 villages (opt-in) |

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

### Villages (from `kh-address/villages`)

```typescript
getVillages(communeCode?: string): Village[]
getVillagesByDistrict(districtCode: string): Village[]
getVillagesByProvince(provinceCode: string): Village[]
getVillageByCode(code: string): Village | undefined
getFullAddressWithVillage(villageCode: string): { village?, commune?, district?, province? }
```

### Postal Codes

```typescript
// Admin code → postal code (official Prakas No.77, Dec 2025)
getPostalCode(adminCode: string): string | undefined

// Postal code → admin codes
lookupByPostalCode(postalCode: string): { provinceCode?, districtCode?, communeCode? }
```

**Important:** 43 communes have postal codes that differ from their admin codes (mostly in Phnom Penh due to khan reorganization). This library handles all mismatches correctly using the official Ministry of Posts and Telecommunications data.

### Search / Autocomplete

```typescript
searchAddress(query: string, options?: SearchOptions): SearchResult[]
```

Options:
```typescript
interface SearchOptions {
  limit?: number;            // Max results (default: 10)
  type?: 'province' | 'district' | 'commune';
  provinceCode?: string;     // Filter within a province
}
```

### Formatting

```typescript
formatAddress(address: StructuredAddress, language?: 'en' | 'km'): string
formatAddressFromCode(code: string, language?: 'en' | 'km'): string
```

### Parsing

```typescript
parseAddress(input: string): { provinceCode?, districtCode?, communeCode? }

parseAddress('Tonle Basak, Chamkar Mon, Phnom Penh');
// → { provinceCode: '12', districtCode: '1201', communeCode: '120101' }
```

### Hierarchy Lookup

```typescript
getFullAddress(code: string): { province?, district?, commune? }
```

## Data

| Level | Count | Source |
|-------|-------|--------|
| Provinces | 25 | NCDDS Gazetteer |
| Districts | 210 | NCDDS Gazetteer |
| Communes | 1,652 | NCDDS Gazetteer |
| Villages | 14,578 | NCDDS Gazetteer |
| Postal codes | 1,887 | Prakas No.77 (Dec 2025) |

## Data Sources & References

- **Primary data:** [pumi](https://github.com/dwilkie/pumi) — Open source geodata for Cambodia's administrative regions, sourced from the official NCDDS Gazetteer
- **Postal codes:** [Open Development Cambodia - Postal Codes](https://data.opendevelopmentcambodia.net/en/dataset/postal-codes) — Official Prakas No.77 (Dec 30, 2025) from Ministry of Posts and Telecommunications
- **Official Gazetteer:** [NCDD Admin Database (Oct 2024)](https://data.opendevelopmentmekong.net/en/dataset/cambodia-gazetteer/resource/21966b05-6151-47ab-8cdf-331463193fac) — National Committee for Sub-National Democratic Development Secretariat
- **Ministry of Land Management:** [MLMUPC Gazetteer of Cambodia (2023)](https://mlmupc.gov.kh/2023/10/26/gazetteer-cambodia/) — Ministry of Land Management, Urban Planning and Construction
- **Cambodia Postal Code:** [cambodiapostalcode.com](https://www.cambodiapostalcode.com/) — Community postal code reference
- **UN GEGN:** [Cambodia country report (2025)](https://unstats.un.org/unsd/ungegn/sessions/4th_session_2025/documents/GEGN.2_2025_73_CRP73_item4a.pdf) — United Nations Group of Experts on Geographical Names
- **HDX boundaries:** [Cambodia Admin Boundaries](https://data.humdata.org/dataset/cod-ab-khm) — Humanitarian Data Exchange GeoJSON/Shapefiles
- **Open Development Cambodia:** [Cambodia Gazetteer Dataset](https://opendevelopmentcambodia.net/dataset/?id=cambodia-gazetteer)

## License

MIT

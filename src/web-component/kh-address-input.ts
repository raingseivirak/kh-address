import type { SearchResult, Language } from "../types.js";
import { searchAddress } from "../search.js";
import {
  getProvinceByCode,
  getDistrictByCode,
  getCommuneByCode,
} from "../data.js";
import { getPostalCode } from "../postal.js";

const STYLES = `
:host {
  display: block;
  position: relative;
  font-family: system-ui, -apple-system, sans-serif;
}
input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box;
}
input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59,130,246,.15);
}
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1);
  z-index: 50;
  max-height: 280px;
  overflow-y: auto;
  display: none;
}
.dropdown.open { display: block; }
.item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}
.item:hover, .item.active { background: #f3f4f6; }
.item-type {
  font-size: 10px;
  text-transform: uppercase;
  color: #9ca3af;
  font-weight: 600;
  letter-spacing: .05em;
}
.item-name { font-size: 14px; color: #111827; }
.item-parent { font-size: 12px; color: #6b7280; }
.no-results {
  padding: 12px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}
`;

export class KhAddressInput extends HTMLElement {
  private input!: HTMLInputElement;
  private dropdown!: HTMLDivElement;
  private results: SearchResult[] = [];
  private activeIndex = -1;
  private debounceTimer?: ReturnType<typeof setTimeout>;

  static get observedAttributes() {
    return ["language", "placeholder", "max-results", "value"];
  }

  get language(): Language {
    return (this.getAttribute("language") as Language) || "en";
  }

  get maxResults(): number {
    return parseInt(this.getAttribute("max-results") || "8", 10);
  }

  get value(): string {
    return this.input?.value || "";
  }

  set value(v: string) {
    if (this.input) this.input.value = v;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLES;

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.placeholder =
      this.getAttribute("placeholder") ||
      (this.language === "km" ? "វាយអាសយដ្ឋាន..." : "Type an address...");
    this.input.autocomplete = "off";
    this.input.setAttribute("role", "combobox");
    this.input.setAttribute("aria-expanded", "false");
    this.input.setAttribute("aria-autocomplete", "list");

    this.dropdown = document.createElement("div");
    this.dropdown.className = "dropdown";
    this.dropdown.setAttribute("role", "listbox");

    shadow.appendChild(style);
    shadow.appendChild(this.input);
    shadow.appendChild(this.dropdown);

    this.input.addEventListener("input", this.onInput.bind(this));
    this.input.addEventListener("keydown", this.onKeyDown.bind(this));
    this.input.addEventListener("focus", () => {
      if (this.results.length > 0) this.openDropdown();
    });
    this.input.addEventListener("blur", () => {
      setTimeout(() => this.closeDropdown(), 200);
    });
  }

  attributeChangedCallback(name: string, _old: string, val: string) {
    if (name === "placeholder" && this.input) this.input.placeholder = val;
    if (name === "value" && this.input) this.input.value = val;
  }

  private onInput() {
    const q = this.input.value.trim();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (q.length < 1) {
      this.results = [];
      this.closeDropdown();
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.results = searchAddress(q, { limit: this.maxResults });
      this.activeIndex = -1;
      this.renderResults();
      if (this.results.length > 0) this.openDropdown();
      else this.closeDropdown();
    }, 150);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.activeIndex = Math.min(this.activeIndex + 1, this.results.length - 1);
      this.renderResults();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this.renderResults();
    } else if (e.key === "Enter" && this.activeIndex >= 0) {
      e.preventDefault();
      this.selectItem(this.results[this.activeIndex]);
    } else if (e.key === "Escape") {
      this.closeDropdown();
    }
  }

  private selectItem(result: SearchResult) {
    const detail = this.buildSelection(result);
    const displayName =
      this.language === "km" ? detail.formatted.km : detail.formatted.en;
    this.input.value = displayName;
    this.closeDropdown();

    this.dispatchEvent(
      new CustomEvent("address-select", { detail, bubbles: true })
    );
  }

  private buildSelection(result: SearchResult): {
    type: string;
    code: string;
    nameEn: string;
    nameKm: string;
    provinceCode?: string;
    districtCode?: string;
    communeCode?: string;
    postalCode?: string;
    formatted: { en: string; km: string };
  } {
    const sel: Record<string, unknown> = {
      type: result.type,
      code: result.code,
      nameEn: result.nameEn,
      nameKm: result.nameKm,
    };

    const enParts: string[] = [];
    const kmParts: string[] = [];

    if (result.type === "commune") {
      sel.communeCode = result.code;
      sel.districtCode = result.code.substring(0, 4);
      sel.provinceCode = result.code.substring(0, 2);
      const c = getCommuneByCode(result.code);
      const d = getDistrictByCode(sel.districtCode as string);
      const p = getProvinceByCode(sel.provinceCode as string);
      if (c) { enParts.push(c.nameEn); kmParts.push(c.nameKm); }
      if (d) { enParts.push(d.nameEn); kmParts.push(d.nameKm); }
      if (p) { enParts.push(p.nameEn); kmParts.push(p.nameKm); }
    } else if (result.type === "district") {
      sel.districtCode = result.code;
      sel.provinceCode = result.code.substring(0, 2);
      const d = getDistrictByCode(result.code);
      const p = getProvinceByCode(sel.provinceCode as string);
      if (d) { enParts.push(d.nameEn); kmParts.push(d.nameKm); }
      if (p) { enParts.push(p.nameEn); kmParts.push(p.nameKm); }
    } else {
      sel.provinceCode = result.code;
      const p = getProvinceByCode(result.code);
      if (p) { enParts.push(p.nameEn); kmParts.push(p.nameKm); }
    }

    sel.postalCode = getPostalCode(result.code);
    sel.formatted = { en: enParts.join(", "), km: kmParts.join(", ") };

    return sel as ReturnType<KhAddressInput["buildSelection"]>;
  }

  private renderResults() {
    this.dropdown.innerHTML = "";
    const lang = this.language;

    if (this.results.length === 0) {
      const noRes = document.createElement("div");
      noRes.className = "no-results";
      noRes.textContent = lang === "km" ? "រកមិនឃើញ" : "No results found";
      this.dropdown.appendChild(noRes);
      return;
    }

    this.results.forEach((result, i) => {
      const item = document.createElement("div");
      item.className = `item${i === this.activeIndex ? " active" : ""}`;
      item.setAttribute("role", "option");

      const typeLine = document.createElement("div");
      typeLine.className = "item-type";
      typeLine.textContent = result.type;

      const nameLine = document.createElement("div");
      nameLine.className = "item-name";
      nameLine.textContent = lang === "km" ? result.nameKm : result.nameEn;

      item.appendChild(typeLine);
      item.appendChild(nameLine);

      const parentParts: string[] = [];
      if (result.district) {
        parentParts.push(lang === "km" ? result.district.nameKm : result.district.nameEn);
      }
      if (result.province) {
        parentParts.push(lang === "km" ? result.province.nameKm : result.province.nameEn);
      }
      if (parentParts.length > 0) {
        const parentLine = document.createElement("div");
        parentLine.className = "item-parent";
        parentLine.textContent = parentParts.join(", ");
        item.appendChild(parentLine);
      }

      item.addEventListener("mouseenter", () => {
        this.activeIndex = i;
        this.renderResults();
      });
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.selectItem(result);
      });

      this.dropdown.appendChild(item);
    });
  }

  private openDropdown() {
    this.dropdown.classList.add("open");
    this.input.setAttribute("aria-expanded", "true");
  }

  private closeDropdown() {
    this.dropdown.classList.remove("open");
    this.input.setAttribute("aria-expanded", "false");
    this.activeIndex = -1;
  }
}

export function register(tagName = "kh-address-input") {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, KhAddressInput);
  }
}

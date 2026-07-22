import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { SearchResult, Language } from "../types.js";
import { searchAddress } from "../search.js";
import {
  getProvinceByCode,
  getDistrictByCode,
  getCommuneByCode,
} from "../data.js";
import { getPostalCode } from "../postal.js";

export interface AddressSelection {
  type: "province" | "district" | "commune";
  code: string;
  nameEn: string;
  nameKm: string;
  provinceCode?: string;
  districtCode?: string;
  communeCode?: string;
  postalCode?: string;
  formatted: { en: string; km: string };
}

export interface UseAddressAutocompleteOptions {
  language?: Language;
  maxResults?: number;
  minChars?: number;
  debounceMs?: number;
  filterType?: "province" | "district" | "commune";
  filterProvinceCode?: string;
}

export interface UseAddressAutocompleteReturn {
  query: string;
  setQuery: (value: string) => void;
  results: SearchResult[];
  isOpen: boolean;
  activeIndex: number;
  select: (result: SearchResult) => void;
  selection: AddressSelection | null;
  clear: () => void;
  inputProps: {
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    onKeyDown: (e: { key: string; preventDefault: () => void }) => void;
    onFocus: () => void;
    onBlur: () => void;
    role: string;
    "aria-expanded": boolean;
    "aria-autocomplete": "list" | "none" | "inline" | "both";
    "aria-activedescendant": string;
    autoComplete: string;
  };
  listProps: {
    role: string;
    id: string;
  };
  getItemProps: (index: number) => {
    id: string;
    role: string;
    "aria-selected": boolean;
    onMouseEnter: () => void;
    onMouseDown: (e: { preventDefault: () => void }) => void;
  };
}

function buildSelection(
  result: SearchResult,
  language: Language
): AddressSelection {
  const selection: AddressSelection = {
    type: result.type as "province" | "district" | "commune",
    code: result.code,
    nameEn: result.nameEn,
    nameKm: result.nameKm,
    formatted: { en: "", km: "" },
  };

  const enParts: string[] = [];
  const kmParts: string[] = [];

  if (result.type === "commune") {
    selection.communeCode = result.code;
    selection.districtCode = result.code.substring(0, 4);
    selection.provinceCode = result.code.substring(0, 2);
    const commune = getCommuneByCode(result.code);
    const district = getDistrictByCode(selection.districtCode);
    const province = getProvinceByCode(selection.provinceCode);
    if (commune) {
      enParts.push(commune.nameEn);
      kmParts.push(commune.nameKm);
    }
    if (district) {
      enParts.push(district.nameEn);
      kmParts.push(district.nameKm);
    }
    if (province) {
      enParts.push(province.nameEn);
      kmParts.push(province.nameKm);
    }
  } else if (result.type === "district") {
    selection.districtCode = result.code;
    selection.provinceCode = result.code.substring(0, 2);
    const district = getDistrictByCode(result.code);
    const province = getProvinceByCode(selection.provinceCode);
    if (district) {
      enParts.push(district.nameEn);
      kmParts.push(district.nameKm);
    }
    if (province) {
      enParts.push(province.nameEn);
      kmParts.push(province.nameKm);
    }
  } else {
    selection.provinceCode = result.code;
    const province = getProvinceByCode(result.code);
    if (province) {
      enParts.push(province.nameEn);
      kmParts.push(province.nameKm);
    }
  }

  selection.postalCode = getPostalCode(result.code);
  selection.formatted = { en: enParts.join(", "), km: kmParts.join(", ") };

  return selection;
}

export function useAddressAutocomplete(
  options: UseAddressAutocompleteOptions = {}
): UseAddressAutocompleteReturn {
  const {
    language = "en",
    maxResults = 8,
    minChars = 1,
    debounceMs = 150,
    filterType,
    filterProvinceCode,
  } = options;

  const [query, setQueryRaw] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selection, setSelection] = useState<AddressSelection | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listId = useMemo(
    () => "kh-addr-list-" + Math.random().toString(36).slice(2, 8),
    []
  );

  const setQuery = useCallback(
    (value: string) => {
      setQueryRaw(value);
      setSelection(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < minChars) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      debounceRef.current = setTimeout(() => {
        const found = searchAddress(value, {
          limit: maxResults,
          type: filterType,
          provinceCode: filterProvinceCode,
        });
        setResults(found);
        setIsOpen(found.length > 0);
        setActiveIndex(-1);
      }, debounceMs);
    },
    [maxResults, minChars, debounceMs, filterType, filterProvinceCode]
  );

  const select = useCallback(
    (result: SearchResult) => {
      const sel = buildSelection(result, language);
      setSelection(sel);
      const displayName =
        language === "km" ? sel.formatted.km : sel.formatted.en;
      setQueryRaw(displayName);
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [language]
  );

  const clear = useCallback(() => {
    setQueryRaw("");
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setSelection(null);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const inputProps = useMemo(
    () => ({
      value: query,
      onChange: (e: { target: { value: string } }) => setQuery(e.target.value),
      onKeyDown: (e: { key: string; preventDefault: () => void }) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
          e.preventDefault();
          select(results[activeIndex]);
        } else if (e.key === "Escape") {
          setIsOpen(false);
        }
      },
      onFocus: () => {
        if (results.length > 0) setIsOpen(true);
      },
      onBlur: () => {
        setTimeout(() => setIsOpen(false), 200);
      },
      role: "combobox" as const,
      "aria-expanded": isOpen,
      "aria-autocomplete": "list" as const,
      "aria-activedescendant":
        activeIndex >= 0 ? `${listId}-item-${activeIndex}` : "",
      autoComplete: "off" as const,
    }),
    [query, isOpen, activeIndex, results, listId, setQuery, select]
  );

  const listProps = useMemo(
    () => ({
      role: "listbox" as const,
      id: listId,
    }),
    [listId]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      id: `${listId}-item-${index}`,
      role: "option" as const,
      "aria-selected": index === activeIndex,
      onMouseEnter: () => setActiveIndex(index),
      onMouseDown: (e: { preventDefault: () => void }) => {
        e.preventDefault();
        select(results[index]);
      },
    }),
    [listId, activeIndex, results, select]
  );

  return {
    query,
    setQuery,
    results,
    isOpen,
    activeIndex,
    select,
    selection,
    clear,
    inputProps,
    listProps,
    getItemProps,
  };
}

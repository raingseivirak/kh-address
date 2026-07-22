import React from 'react';
import { L as Language, S as SearchResult } from './types-D09QxsWl.js';

interface AddressSelection {
    type: "province" | "district" | "commune";
    code: string;
    nameEn: string;
    nameKm: string;
    provinceCode?: string;
    districtCode?: string;
    communeCode?: string;
    postalCode?: string;
    formatted: {
        en: string;
        km: string;
    };
}
interface UseAddressAutocompleteOptions {
    language?: Language;
    maxResults?: number;
    minChars?: number;
    debounceMs?: number;
    filterType?: "province" | "district" | "commune";
    filterProvinceCode?: string;
}
interface UseAddressAutocompleteReturn {
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
        onChange: (e: {
            target: {
                value: string;
            };
        }) => void;
        onKeyDown: (e: {
            key: string;
            preventDefault: () => void;
        }) => void;
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
        onMouseDown: (e: {
            preventDefault: () => void;
        }) => void;
    };
}
declare function useAddressAutocomplete(options?: UseAddressAutocompleteOptions): UseAddressAutocompleteReturn;

interface AddressAutocompleteClassNames {
    root?: string;
    input?: string;
    dropdown?: string;
    item?: string;
    itemActive?: string;
    itemType?: string;
    itemName?: string;
    itemParent?: string;
    noResults?: string;
}
interface AddressAutocompleteProps extends UseAddressAutocompleteOptions {
    placeholder?: string;
    className?: string;
    classNames?: AddressAutocompleteClassNames;
    style?: React.CSSProperties;
    onSelect?: (selection: AddressSelection) => void;
    onChange?: (query: string) => void;
    value?: string;
    renderItem?: (result: SearchResult, isActive: boolean, language: Language) => React.ReactNode;
    noResultsText?: string;
    unstyled?: boolean;
}
declare function AddressAutocomplete({ placeholder, className, classNames, style, onSelect, onChange, value, renderItem, noResultsText, unstyled, ...hookOptions }: AddressAutocompleteProps): React.JSX.Element;

export { AddressAutocomplete, type AddressAutocompleteClassNames, type AddressAutocompleteProps, type AddressSelection, type UseAddressAutocompleteOptions, type UseAddressAutocompleteReturn, useAddressAutocomplete };

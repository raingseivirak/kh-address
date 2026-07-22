import React from "react";
import type { SearchResult, Language } from "../types.js";
import {
  useAddressAutocomplete,
  type AddressSelection,
  type UseAddressAutocompleteOptions,
} from "./use-address-autocomplete.js";

export interface AddressAutocompleteClassNames {
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

export interface AddressAutocompleteProps extends UseAddressAutocompleteOptions {
  placeholder?: string;
  className?: string;
  classNames?: AddressAutocompleteClassNames;
  style?: React.CSSProperties;
  onSelect?: (selection: AddressSelection) => void;
  onChange?: (query: string) => void;
  value?: string;
  renderItem?: (
    result: SearchResult,
    isActive: boolean,
    language: Language
  ) => React.ReactNode;
  noResultsText?: string;
  unstyled?: boolean;
}

const defaultStyles: Record<string, React.CSSProperties> = {
  root: {
    position: "relative",
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1)",
    zIndex: 50,
    maxHeight: "280px",
    overflowY: "auto",
  },
  item: {
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    borderBottom: "1px solid #f3f4f6",
  },
  itemActive: {
    background: "#f3f4f6",
  },
  itemType: {
    fontSize: "10px",
    textTransform: "uppercase",
    color: "#9ca3af",
    fontWeight: 600,
    letterSpacing: "0.05em",
  },
  itemName: {
    fontSize: "14px",
    color: "#111827",
  },
  itemParent: {
    fontSize: "12px",
    color: "#6b7280",
  },
  noResults: {
    padding: "12px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "13px",
  },
};

function DefaultItem({
  result,
  isActive,
  language,
  classNames,
  unstyled,
}: {
  result: SearchResult;
  isActive: boolean;
  language: Language;
  classNames?: AddressAutocompleteClassNames;
  unstyled?: boolean;
}) {
  const name = language === "km" ? result.nameKm : result.nameEn;
  const parentParts: string[] = [];
  if (result.district) {
    parentParts.push(
      language === "km" ? result.district.nameKm : result.district.nameEn
    );
  }
  if (result.province) {
    parentParts.push(
      language === "km" ? result.province.nameKm : result.province.nameEn
    );
  }

  return (
    <div
      className={`${classNames?.item || ""} ${isActive ? classNames?.itemActive || "" : ""}`.trim() || undefined}
      style={
        unstyled
          ? undefined
          : { ...defaultStyles.item, ...(isActive ? defaultStyles.itemActive : {}) }
      }
    >
      <span
        className={classNames?.itemType || undefined}
        style={unstyled ? undefined : defaultStyles.itemType}
      >
        {result.type}
      </span>
      <span
        className={classNames?.itemName || undefined}
        style={unstyled ? undefined : defaultStyles.itemName}
      >
        {name}
      </span>
      {parentParts.length > 0 && (
        <span
          className={classNames?.itemParent || undefined}
          style={unstyled ? undefined : defaultStyles.itemParent}
        >
          {parentParts.join(", ")}
        </span>
      )}
    </div>
  );
}

export function AddressAutocomplete({
  placeholder,
  className,
  classNames,
  style,
  onSelect,
  onChange,
  value,
  renderItem,
  noResultsText,
  unstyled,
  ...hookOptions
}: AddressAutocompleteProps) {
  const language = hookOptions.language || "en";
  const {
    query,
    setQuery,
    results,
    isOpen,
    activeIndex,
    selection,
    inputProps,
    listProps,
    getItemProps,
  } = useAddressAutocomplete(hookOptions);

  const prevSelectionRef = React.useRef<AddressSelection | null>(null);

  React.useEffect(() => {
    if (selection && selection !== prevSelectionRef.current) {
      prevSelectionRef.current = selection;
      onSelect?.(selection);
    }
  }, [selection, onSelect]);

  React.useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value);
    }
  }, [value]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      inputProps.onChange(e);
      onChange?.(e.target.value);
    },
    [inputProps.onChange, onChange]
  );

  const showNoResults =
    isOpen && results.length === 0 && query.trim().length > 0;

  return (
    <div
      className={`${className || ""} ${classNames?.root || ""}`.trim() || undefined}
      style={unstyled ? style : { ...defaultStyles.root, ...style }}
    >
      <input
        {...inputProps}
        onChange={handleChange}
        placeholder={
          placeholder ||
          (language === "km" ? "វាយអាសយដ្ឋាន..." : "Type an address...")
        }
        className={classNames?.input || undefined}
        style={unstyled ? undefined : defaultStyles.input}
      />
      {(isOpen || showNoResults) && (
        <div
          {...listProps}
          className={classNames?.dropdown || undefined}
          style={unstyled ? undefined : defaultStyles.dropdown}
        >
          {results.map((result, i) => (
            <div key={result.code + result.type} {...getItemProps(i)}>
              {renderItem ? (
                renderItem(result, i === activeIndex, language)
              ) : (
                <DefaultItem
                  result={result}
                  isActive={i === activeIndex}
                  language={language}
                  classNames={classNames}
                  unstyled={unstyled}
                />
              )}
            </div>
          ))}
          {showNoResults && (
            <div
              className={classNames?.noResults || undefined}
              style={unstyled ? undefined : defaultStyles.noResults}
            >
              {noResultsText || (language === "km" ? "រកមិនឃើញ" : "No results found")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

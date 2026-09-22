"use client";

import { useEffect, useRef, useState } from "react";
import { COLOR_MAP } from "@/components/ui";
import { SIZES } from "@/components/ProductGridPage";

export interface Variant {
  color: string;
  size: string;
  stock: number;
  sku: string;
}

const ALL_COLORS = Object.keys(COLOR_MAP);
const CUSTOM_OPTION = "__custom__";

// Shared dropdown-with-custom-option pattern for color/size — falls back to
// a free-text field when the value isn't in the known list (or "Custom…" is
// picked), so one-off products aren't blocked by a fixed option set.
function PickerSelect({
  value,
  onChange,
  options,
  placeholder,
  customPlaceholder,
  renderOption,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  customPlaceholder: string;
  renderOption?: (option: string) => React.ReactNode;
}) {
  const isKnown = options.includes(value);
  const [customMode, setCustomMode] = useState(!isKnown && value !== "");

  if (customMode) {
    return (
      <div className="flex items-center gap-1">
        <input
          className="border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-ink w-full"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={customPlaceholder}
          autoFocus
        />
        <button
          type="button"
          onClick={() => { setCustomMode(false); onChange(""); }}
          aria-label="Use dropdown instead"
          title="Use dropdown instead"
          className="shrink-0 text-muted hover:text-ink text-xs px-1"
        >
          ↩
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      {renderOption && value && options.includes(value) && (
        <span className="absolute left-2 pointer-events-none">{renderOption(value)}</span>
      )}
      <select
        className={`w-full border border-border rounded py-1.5 text-xs outline-none focus:border-ink bg-white appearance-none ${
          renderOption && value && options.includes(value) ? "pl-7 pr-2" : "px-2"
        }`}
        value={isKnown ? value : ""}
        onChange={(e) => {
          if (e.target.value === CUSTOM_OPTION) {
            setCustomMode(true);
            onChange("");
          } else {
            onChange(e.target.value);
          }
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value={CUSTOM_OPTION}>Custom…</option>
      </select>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <PickerSelect
      value={value}
      onChange={onChange}
      options={ALL_COLORS}
      placeholder="Select color…"
      customPlaceholder="Custom color name"
      renderOption={(c) => (
        <span className="w-3 h-3 rounded-full border border-black/10 block" style={{ background: COLOR_MAP[c] }} />
      )}
    />
  );
}

function SizePicker({ value, onChange }: { value: string; onChange: (size: string) => void }) {
  return (
    <PickerSelect
      value={value}
      onChange={onChange}
      options={SIZES}
      placeholder="Select size…"
      customPlaceholder="Custom size"
    />
  );
}

// Dropdown that lists every option with a checkmark next to the ones already
// selected — click an option to toggle it. Closes on outside click.
function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  renderSwatch,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (option: string) => void;
  renderSwatch?: (option: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, () => setOpen(false));

  const summary = selected.size === 0 ? label : `${selected.size} selected`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-border rounded px-3 py-2 text-xs bg-white hover:border-ink transition-colors"
      >
        <span className={selected.size === 0 ? "text-muted" : ""}>{summary}</span>
        <span className="text-muted">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto border border-border rounded-lg bg-white shadow-lg py-1">
          {options.map((o) => {
            const isSelected = selected.has(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => onToggle(o)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 text-left"
              >
                <span className="w-3.5 shrink-0">{isSelected ? "✓" : ""}</span>
                {renderSwatch?.(o)}
                <span>{o}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

interface Props {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

function skuFor(color: string, size: string): string {
  const c = color.slice(0, 2).toUpperCase();
  const s = size.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return `${c}-${s}`;
}

export function VariantEditor({ variants, onChange }: Props) {
  const [bulkColors, setBulkColors] = useState<Set<string>>(new Set());
  const [bulkSizes, setBulkSizes] = useState<Set<string>>(new Set());
  const [bulkStock, setBulkStock] = useState("5");
  const [expandedColor, setExpandedColor] = useState<string | null>(null);

  function updateRow(index: number, patch: Partial<Variant>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeRow(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  function removeGroup(color: string) {
    onChange(variants.filter((v) => v.color !== color));
    if (expandedColor === color) setExpandedColor(null);
  }

  function addSizeToGroup(color: string, size: string) {
    if (variants.some((v) => v.color === color && v.size === size)) return;
    onChange([...variants, { color, size, stock: 0, sku: skuFor(color, size) }]);
  }

  function addBlankGroup() {
    const newColor = ALL_COLORS.find((c) => !variants.some((v) => v.color === c)) ?? "";
    onChange([...variants, { color: newColor, size: "", stock: 0, sku: "" }]);
    setExpandedColor(newColor);
  }

  function toggleBulkColor(color: string) {
    setBulkColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  }

  function toggleBulkSize(size: string) {
    setBulkSizes((prev) => {
      const next = new Set(prev);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return next;
    });
  }

  function generateMatrix() {
    const stock = parseInt(bulkStock, 10) || 0;
    if (bulkColors.size === 0 || bulkSizes.size === 0) return;

    const existingKeys = new Set(variants.map((v) => `${v.color}__${v.size}`));
    const added: Variant[] = [];
    for (const color of bulkColors) {
      for (const size of bulkSizes) {
        const key = `${color}__${size}`;
        if (existingKeys.has(key)) continue;
        added.push({ color, size, stock, sku: skuFor(color, size) });
      }
    }
    onChange([...variants, ...added]);
    setBulkColors(new Set());
    setBulkSizes(new Set());
  }

  const colorGroups: { color: string; indices: number[] }[] = [];
  const groupIndex = new Map<string, number>();
  variants.forEach((v, i) => {
    if (!groupIndex.has(v.color)) {
      groupIndex.set(v.color, colorGroups.length);
      colorGroups.push({ color: v.color, indices: [] });
    }
    colorGroups[groupIndex.get(v.color)!].indices.push(i);
  });

  return (
    <div>
      <div className="border border-border rounded-lg p-4 mb-4 bg-gray-50">
        <p className="text-xs font-medium mb-2">Generate variants</p>
        <div className="grid grid-cols-3 gap-2">
          <MultiSelectDropdown
            label="Select colors…"
            options={ALL_COLORS}
            selected={bulkColors}
            onToggle={toggleBulkColor}
            renderSwatch={(c) => (
              <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ background: COLOR_MAP[c] }} />
            )}
          />
          <MultiSelectDropdown
            label="Select sizes…"
            options={SIZES}
            selected={bulkSizes}
            onToggle={toggleBulkSize}
          />
          <input
            className="border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-ink"
            placeholder="Default stock"
            type="number"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
          />
        </div>
        <p className="text-[10px] text-muted mt-1.5">
          Pick colors and sizes above, then generate every combination at once.
        </p>
        <button
          type="button"
          onClick={generateMatrix}
          className="mt-2 text-xs px-3 py-1.5 border border-border rounded hover:border-ink transition-colors"
        >
          + Generate
        </button>
      </div>

      {colorGroups.length > 0 && (
        <div className="mb-3 border border-border rounded-lg overflow-hidden divide-y divide-border">
          {colorGroups.map(({ color, indices }) => {
            const isExpanded = expandedColor === color;
            const sizesInGroup = new Set(indices.map((i) => variants[i].size).filter(Boolean));
            return (
              <div key={color}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedColor(isExpanded ? null : color)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedColor(isExpanded ? null : color);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {color && COLOR_MAP[color] && (
                    <span className="w-4 h-4 rounded-full border border-black/10 shrink-0" style={{ background: COLOR_MAP[color] }} />
                  )}
                  <span className="text-sm font-medium flex-1 truncate">{color || "Untitled color"}</span>
                  <span className="text-xs text-muted">
                    {indices.length} {indices.length === 1 ? "size" : "sizes"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGroup(color);
                    }}
                    aria-label={`Remove ${color || "color"} group`}
                    className="text-muted hover:text-red-600 transition-colors text-sm px-1"
                  >
                    ×
                  </button>
                  <span className="text-muted text-xs">{isExpanded ? "▲" : "▼"}</span>
                </div>

                {isExpanded && (
                  <div className="p-3 bg-gray-50 border-t border-border" data-lenis-prevent="true">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <label className="grid gap-1">
                        <span className="text-[10px] text-muted uppercase tracking-wide">Color</span>
                        <ColorPicker
                          value={color}
                          onChange={(newColor) => {
                            indices.forEach((i) => updateRow(i, { color: newColor }));
                            if (isExpanded) setExpandedColor(newColor);
                          }}
                        />
                      </label>
                      <label className="grid gap-1">
                        <span className="text-[10px] text-muted uppercase tracking-wide">Add size</span>
                        <MultiSelectDropdown
                          label="Add a size…"
                          options={SIZES}
                          selected={sizesInGroup}
                          onToggle={(size) => {
                            if (sizesInGroup.has(size)) {
                              const idx = indices.find((i) => variants[i].size === size);
                              if (idx !== undefined) removeRow(idx);
                            } else {
                              addSizeToGroup(color, size);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="border border-border rounded-lg overflow-hidden bg-white">
                      <div className="grid grid-cols-[1fr_80px_1fr_28px] gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink px-3 py-2 bg-gray-50 border-b border-border">
                        <span>Size</span>
                        <span>Stock</span>
                        <span>SKU</span>
                        <span />
                      </div>
                      <div className="grid gap-2 p-3">
                        {indices.map((i) => (
                          <div key={i} className="grid grid-cols-[1fr_80px_1fr_28px] gap-2 items-center">
                            <SizePicker value={variants[i].size} onChange={(size) => updateRow(i, { size })} />
                            <input
                              className="border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-ink"
                              type="number"
                              min={0}
                              value={variants[i].stock}
                              onChange={(e) => updateRow(i, { stock: parseInt(e.target.value, 10) || 0 })}
                            />
                            <input
                              className="border border-border rounded px-2 py-1.5 text-xs outline-none focus:border-ink font-mono"
                              value={variants[i].sku}
                              onChange={(e) => updateRow(i, { sku: e.target.value })}
                              placeholder="BL-M"
                            />
                            <button
                              type="button"
                              onClick={() => removeRow(i)}
                              aria-label="Remove variant"
                              className="text-muted hover:text-red-600 transition-colors text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={addBlankGroup}
        className="text-xs px-3 py-1.5 border border-border rounded hover:border-ink transition-colors"
      >
        + Add color
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

export interface Variant {
  color: string;
  size: string;
  stock: number;
  sku: string;
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
  const [bulkColors, setBulkColors] = useState("");
  const [bulkSizes, setBulkSizes] = useState("");
  const [bulkStock, setBulkStock] = useState("5");

  function updateRow(index: number, patch: Partial<Variant>) {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeRow(index: number) {
    onChange(variants.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...variants, { color: "", size: "", stock: 0, sku: "" }]);
  }

  function generateMatrix() {
    const colors = bulkColors.split(",").map((c) => c.trim()).filter(Boolean);
    const sizes = bulkSizes.split(",").map((s) => s.trim()).filter(Boolean);
    const stock = parseInt(bulkStock, 10) || 0;
    if (colors.length === 0 || sizes.length === 0) return;

    const existingKeys = new Set(variants.map((v) => `${v.color}__${v.size}`));
    const added: Variant[] = [];
    for (const color of colors) {
      for (const size of sizes) {
        const key = `${color}__${size}`;
        if (existingKeys.has(key)) continue;
        added.push({ color, size, stock, sku: skuFor(color, size) });
      }
    }
    onChange([...variants, ...added]);
    setBulkColors("");
    setBulkSizes("");
  }

  return (
    <div>
      <div className="border border-[--color-border] rounded-lg p-4 mb-4 bg-[--color-gray-50]">
        <p className="text-xs font-medium mb-2">Generate variants</p>
        <div className="grid grid-cols-3 gap-2">
          <input
            className="border border-[--color-border] rounded px-2 py-1.5 text-xs outline-none focus:border-[--color-ink]"
            placeholder="Colors (comma-separated)"
            value={bulkColors}
            onChange={(e) => setBulkColors(e.target.value)}
          />
          <input
            className="border border-[--color-border] rounded px-2 py-1.5 text-xs outline-none focus:border-[--color-ink]"
            placeholder="Sizes (comma-separated)"
            value={bulkSizes}
            onChange={(e) => setBulkSizes(e.target.value)}
          />
          <input
            className="border border-[--color-border] rounded px-2 py-1.5 text-xs outline-none focus:border-[--color-ink]"
            placeholder="Default stock"
            type="number"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
          />
        </div>
        <p className="text-[10px] text-[--color-muted] mt-1.5">
          e.g. Colors: <code>Black, Charcoal</code> · Sizes: <code>S, M, L, XL</code> → generates every combination
        </p>
        <button
          type="button"
          onClick={generateMatrix}
          className="mt-2 text-xs px-3 py-1.5 border border-[--color-border] rounded hover:border-[--color-ink] transition-colors"
        >
          + Generate
        </button>
      </div>

      {variants.length > 0 && (
        <div className="grid gap-2 mb-3">
          <div className="grid grid-cols-[1fr_1fr_80px_1fr_28px] gap-2 text-[10px] uppercase tracking-wide text-[--color-muted] px-1">
            <span>Color</span>
            <span>Size</span>
            <span>Stock</span>
            <span>SKU</span>
            <span />
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_80px_1fr_28px] gap-2 items-center">
              <input
                className="border border-[--color-border] rounded px-2 py-1.5 text-xs outline-none focus:border-[--color-ink]"
                value={v.color}
                onChange={(e) => updateRow(i, { color: e.target.value })}
                placeholder="Black"
              />
              <input
                className="border border-[--color-border] rounded px-2 py-1.5 text-xs outline-none focus:border-[--color-ink]"
                value={v.size}
                onChange={(e) => updateRow(i, { size: e.target.value })}
                placeholder="M"
              />
              <input
                className="border border-[--color-border] rounded px-2 py-1.5 text-xs outline-none focus:border-[--color-ink]"
                type="number"
                min={0}
                value={v.stock}
                onChange={(e) => updateRow(i, { stock: parseInt(e.target.value, 10) || 0 })}
              />
              <input
                className="border border-[--color-border] rounded px-2 py-1.5 text-xs outline-none focus:border-[--color-ink] font-mono"
                value={v.sku}
                onChange={(e) => updateRow(i, { sku: e.target.value })}
                placeholder="BL-M"
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                aria-label="Remove variant"
                className="text-[--color-muted] hover:text-red-600 transition-colors text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="text-xs px-3 py-1.5 border border-[--color-border] rounded hover:border-[--color-ink] transition-colors"
      >
        + Add single variant
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { VariantEditor, Variant } from "@/components/admin/VariantEditor";

const CATEGORIES = ["Outerwear", "Knitwear", "Layering", "Accessories"];
const FABRICS = ["Wool", "Cashmere", "Merino", "Cotton", "Down", "Leather", "Synthetic"];

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  fabric: string;
  tags: string;
  images: string[];
  variants: Variant[];
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: CATEGORIES[0],
  fabric: "",
  tags: "",
  images: [],
  variants: [],
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminProductsPage() {
  const { isAuthenticated } = useConvexAuth();
  const products = useQuery(api.products.listAdmin, isAuthenticated ? {} : "skip");
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function set<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugify(name),
    }));
  }

  function startEdit(product: NonNullable<typeof products>[number]) {
    setEditingId(product._id);
    setSlugTouched(true);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      category: product.category,
      fabric: product.fabric ?? "",
      tags: product.tags.join(", "),
      images: product.images ?? [],
      variants: product.variants ?? [],
    });
    setFormOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setError(null);
    setFormOpen(false);
  }

  function validate(): string | null {
    if (!form.name.trim()) return "Name is required";
    if (!form.slug.trim()) return "Slug is required";
    if (!form.description.trim()) return "Description is required";
    const price = parseFloat(form.price);
    if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number";
    if (form.variants.length === 0) return "Add at least one variant (color/size/stock)";
    for (const v of form.variants) {
      if (!v.color.trim() || !v.size.trim() || !v.sku.trim()) {
        return "Every variant needs a color, size, and SKU";
      }
      if (v.stock < 0) return "Variant stock cannot be negative";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        category: form.category,
        fabric: form.fabric || undefined,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: form.images,
        variants: form.variants,
      };
      if (editingId) {
        await updateProduct({ id: editingId, ...payload });
      } else {
        await createProduct(payload);
      }
      cancelEdit();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const totalStock = (variants: Variant[]) => variants.reduce((s, v) => s + v.stock, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-[--font-editorial]">Products</h1>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="bg-[--color-ink] text-[--color-paper] text-sm px-4 py-2 rounded"
          >
            + New Product
          </button>
        )}
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="border border-[--color-border] rounded-lg p-6 mb-8 grid gap-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">{editingId ? "Edit Product" : "New Product"}</h2>
            <button type="button" onClick={cancelEdit} className="text-xs text-[--color-muted] hover:text-[--color-ink]">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-[--color-muted]">Name</span>
              <input
                className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink]"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-[--color-muted]">Slug</span>
              <input
                className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink] font-mono"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                required
              />
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-xs text-[--color-muted]">Description</span>
            <textarea
              className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink] resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </label>

          <div className="grid grid-cols-4 gap-3">
            <label className="grid gap-1">
              <span className="text-xs text-[--color-muted]">Price (CAD)</span>
              <input
                className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink]"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                required
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-[--color-muted]">Compare-at Price</span>
              <input
                className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink]"
                type="number"
                step="0.01"
                min="0"
                value={form.compareAtPrice}
                onChange={(e) => set("compareAtPrice", e.target.value)}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-[--color-muted]">Category</span>
              <select
                className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink] bg-white"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-xs text-[--color-muted]">Fabric</span>
              <select
                className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink] bg-white"
                value={form.fabric}
                onChange={(e) => set("fabric", e.target.value)}
              >
                <option value="">—</option>
                {FABRICS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-1">
            <span className="text-xs text-[--color-muted]">Tags (comma-separated — e.g. new-in, men, bestseller)</span>
            <input
              className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink]"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </label>

          <div>
            <p className="text-xs text-[--color-muted] mb-2">Images</p>
            <ImageUploader images={form.images} onChange={(images) => set("images", images)} />
          </div>

          <div>
            <p className="text-xs text-[--color-muted] mb-2">Variants (color / size / stock / SKU)</p>
            <VariantEditor variants={form.variants} onChange={(variants) => set("variants", variants)} />
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[--color-ink] text-[--color-paper] text-sm px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-2">
        {products?.map((product) => (
          <div
            key={product._id}
            className="border border-[--color-border] rounded-lg px-4 py-3 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded bg-[--color-gray-100] overflow-hidden shrink-0">
              {product.images?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-[--color-muted]">
                {product.slug} · ${product.price.toFixed(2)} · {totalStock(product.variants)} in stock ·{" "}
                {product.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(product)}
                className="text-xs px-3 py-1 border border-[--color-border] rounded"
              >
                Edit
              </button>
              {product.isActive && (
                <button
                  onClick={() => removeProduct({ id: product._id })}
                  className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded"
                >
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
        {products?.length === 0 && (
          <p className="text-sm text-[--color-muted] text-center py-8">No products yet — create your first one above.</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { VariantEditor, Variant } from "@/components/admin/VariantEditor";
import { stopLenis, startLenis } from "@/lib/lenis";

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

  useEffect(() => {
    if (!formOpen) return;
    document.body.style.overflow = "hidden";
    stopLenis();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cancelEdit();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      startLenis();
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formOpen]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-[--font-editorial]">Products</h1>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="bg-ink text-paper text-sm px-4 py-2 rounded"
          >
            + New Product
          </button>
        )}
      </div>

      {formOpen && typeof document !== "undefined" && createPortal(
        <div
          onClick={cancelEdit}
          data-lenis-prevent="true"
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-10 px-4"
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-paper border border-border rounded-lg p-6 grid gap-5 w-full max-w-6xl shadow-xl"
          >
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h2 className="text-lg font-[--font-editorial]">{editingId ? "Edit Product" : "New Product"}</h2>
            <button
              type="button"
              onClick={cancelEdit}
              aria-label="Close"
              className="text-muted hover:text-ink text-xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="grid gap-5 content-start">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Name</span>
                  <input
                    className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-ink"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Slug</span>
                  <input
                    className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-ink font-mono"
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
                <span className="text-xs text-muted">Description</span>
                <textarea
                  className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-ink resize-none"
                  rows={3}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Price (CAD)</span>
                  <input
                    className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-ink"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-muted">Compare-at Price</span>
                  <input
                    className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-ink"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.compareAtPrice}
                    onChange={(e) => set("compareAtPrice", e.target.value)}
                  />
                </label>
              </div>

              <div>
                <span className="text-xs text-muted mb-1.5 block">Category</span>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("category", c)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        form.category === c
                          ? "bg-ink text-paper border-ink"
                          : "border-border hover:border-ink"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted mb-1.5 block">Fabric</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => set("fabric", "")}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      form.fabric === ""
                        ? "bg-ink text-paper border-ink"
                        : "border-border hover:border-ink"
                    }`}
                  >
                    —
                  </button>
                  {FABRICS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => set("fabric", f)}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        form.fabric === f
                          ? "bg-ink text-paper border-ink"
                          : "border-border hover:border-ink"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <label className="grid gap-1">
                <span className="text-xs text-muted">Tags (comma-separated — e.g. new-in, men, bestseller)</span>
                <input
                  className="border border-border rounded px-3 py-2 text-sm outline-none focus:border-ink"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                />
              </label>
            </div>

            <div className="grid gap-5 content-start">
              <div>
                <p className="text-xs text-muted mb-2">Images</p>
                <ImageUploader images={form.images} onChange={(images) => set("images", images)} />
              </div>

              <div>
                <p className="text-xs text-muted mb-2">Variants (color / size / stock / SKU)</p>
                <VariantEditor variants={form.variants} onChange={(variants) => set("variants", variants)} />
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-xs">{error}</p>}

          <div className="flex gap-2 pt-2 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-paper text-sm px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
            </button>
          </div>
          </form>
        </div>,
        document.body
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products?.map((product) => (
          <div
            key={product._id}
            className="border border-border rounded-lg overflow-hidden group"
          >
            <div className="aspect-3/4 bg-gray-100 relative">
              {product.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                  No image
                </div>
              )}
              {!product.isActive && (
                <span className="absolute top-2 left-2 bg-black/80 text-white text-[10px] uppercase tracking-wide px-2 py-1 rounded">
                  Inactive
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => startEdit(product)}
                  className="text-xs px-3 py-1.5 bg-white rounded font-medium"
                >
                  Edit
                </button>
                {product.isActive ? (
                  <button
                    onClick={() => removeProduct({ id: product._id })}
                    className="text-xs px-3 py-1.5 bg-white text-red-600 rounded font-medium"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => updateProduct({ id: product._id, isActive: true })}
                    className="text-xs px-3 py-1.5 bg-white text-green-700 rounded font-medium"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-muted mt-0.5">
                ${product.price.toFixed(2)} · {totalStock(product.variants)} in stock
              </p>
            </div>
          </div>
        ))}
        {products?.length === 0 && (
          <p className="text-sm text-muted text-center py-8 col-span-full">No products yet — create your first one above.</p>
        )}
      </div>
    </div>
  );
}

export const runtime = 'edge'


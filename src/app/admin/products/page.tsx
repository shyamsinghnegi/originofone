"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  tags: string;
};

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "",
  tags: "",
};

export default function AdminProductsPage() {
  const { isAuthenticated } = useConvexAuth();
  const products = useQuery(api.products.listAdmin, isAuthenticated ? {} : "skip");
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof ProductForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(product: NonNullable<typeof products>[0]) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      category: product.category,
      tags: product.tags.join(", "),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        category: form.category,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: [],
        variants: [],
      };
      if (editingId) {
        await updateProduct({ id: editingId, ...payload });
      } else {
        await createProduct(payload);
      }
      cancelEdit();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-[--font-editorial] mb-8">Products</h1>

      <form
        onSubmit={handleSubmit}
        className="border border-[--color-border] rounded-lg p-6 mb-8 grid gap-3"
      >
        <h2 className="text-sm font-semibold">
          {editingId ? "Edit Product" : "New Product"}
        </h2>
        {[
          { label: "Name", key: "name" as const },
          { label: "Slug", key: "slug" as const },
          { label: "Category", key: "category" as const },
          { label: "Tags (comma-separated)", key: "tags" as const },
          { label: "Price (CAD)", key: "price" as const },
          { label: "Compare-at Price", key: "compareAtPrice" as const },
        ].map(({ label, key }) => (
          <label key={key} className="grid gap-1">
            <span className="text-xs text-[--color-muted]">{label}</span>
            <input
              className="border border-[--color-border] rounded px-3 py-2 text-sm outline-none focus:border-[--color-ink]"
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              required={key !== "compareAtPrice" && key !== "tags"}
            />
          </label>
        ))}
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
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-[--color-ink] text-[--color-paper] text-sm px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm px-4 py-2 rounded border border-[--color-border]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-2">
        {products?.map((product: any) => (
          <div
            key={product._id}
            className="border border-[--color-border] rounded-lg px-4 py-3 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-[--color-muted]">
                {product.slug} · ${product.price.toFixed(2)} ·{" "}
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
              <button
                onClick={() => removeProduct({ id: product._id })}
                className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded"
              >
                Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

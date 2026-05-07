import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

const variantSchema = v.object({
  color: v.string(),
  size: v.string(),
  stock: v.number(),
  sku: v.string(),
});

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user || user.role !== "admin") throw new Error("Forbidden");
  return user;
}

export const list = query({
  args: {
    category: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    if (args.category) {
      products = products.filter((p) => p.category === args.category);
    }
    if (args.tag) {
      products = products.filter((p) => p.tags.includes(args.tag!));
    }
    return products;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.trim();
    if (!q || q.length < 2) return [];

    // Full-text search on name (relevance-ranked)
    const byName = await ctx.db
      .query("products")
      .withSearchIndex("search_name", (sq) =>
        sq.search("name", q).eq("isActive", true)
      )
      .take(20);

    // Also match category / tag / description for broader results
    const seen = new Set(byName.map((p) => p._id));
    const ql = q.toLowerCase();
    const rest = await ctx.db
      .query("products")
      .withIndex("by_active", (sq) => sq.eq("isActive", true))
      .collect();

    const additional = rest.filter(
      (p) =>
        !seen.has(p._id) &&
        (p.category.toLowerCase().includes(ql) ||
          p.tags.some((t) => t.toLowerCase().includes(ql)) ||
          p.description.toLowerCase().includes(ql))
    );

    return [...byName, ...additional].slice(0, 20);
  },
});

export const getRelated = query({
  args: { category: v.string(), excludeSlug: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return products
      .filter((p) => p.category === args.category && p.slug !== args.excludeSlug)
      .slice(0, 4);
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const listAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return ctx.db.query("products").collect();
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    images: v.array(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    variants: v.array(variantSchema),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error(`Slug "${args.slug}" already exists`);
    return ctx.db.insert("products", { ...args, isActive: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    variants: v.optional(v.array(variantSchema)),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { isActive: false });
  },
});

export const decrementStock = internalMutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        color: v.string(),
        size: v.string(),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) continue;
      const variants = product.variants.map((v) => {
        if (v.color === item.color && v.size === item.size) {
          return { ...v, stock: Math.max(0, v.stock - item.quantity) };
        }
        return v;
      });
      await ctx.db.patch(item.productId, { variants });
    }
  },
});

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

const cartItemSchema = v.object({
  productId: v.id("products"),
  slug: v.string(),
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  color: v.string(),
  size: v.string(),
  image: v.string(),
});

async function getOrCreateCart(ctx: any, userId: any) {
  const cart = await ctx.db
    .query("cart")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .unique();
  if (cart) return cart;
  const id = await ctx.db.insert("cart", {
    userId,
    items: [],
    lastUpdated: Date.now(),
  });
  return ctx.db.get(id);
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return null;
    return ctx.db
      .query("cart")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();
  },
});

export const upsertItem = mutation({
  args: { item: cartItemSchema },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const cart = await getOrCreateCart(ctx, user._id);
    const key = `${args.item.productId}-${args.item.color}-${args.item.size}`;
    const existing = cart!.items.find(
      (i: any) =>
        i.productId === args.item.productId &&
        i.color === args.item.color &&
        i.size === args.item.size
    );

    const items = existing
      ? cart!.items.map((i: any) =>
          i.productId === args.item.productId &&
          i.color === args.item.color &&
          i.size === args.item.size
            ? { ...i, quantity: i.quantity + args.item.quantity }
            : i
        )
      : [...cart!.items, args.item];

    await ctx.db.patch(cart!._id, { items, lastUpdated: Date.now() });
  },
});

export const updateQuantity = mutation({
  args: {
    productId: v.id("products"),
    color: v.string(),
    size: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const cart = await ctx.db
      .query("cart")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();
    if (!cart) return;

    const items =
      args.quantity <= 0
        ? cart.items.filter(
            (i) =>
              !(
                i.productId === args.productId &&
                i.color === args.color &&
                i.size === args.size
              )
          )
        : cart.items.map((i) =>
            i.productId === args.productId &&
            i.color === args.color &&
            i.size === args.size
              ? { ...i, quantity: args.quantity }
              : i
          );

    await ctx.db.patch(cart._id, { items, lastUpdated: Date.now() });
  },
});

export const removeItem = mutation({
  args: {
    productId: v.id("products"),
    color: v.string(),
    size: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const cart = await ctx.db
      .query("cart")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();
    if (!cart) return;

    await ctx.db.patch(cart._id, {
      items: cart.items.filter(
        (i) =>
          !(
            i.productId === args.productId &&
            i.color === args.color &&
            i.size === args.size
          )
      ),
      lastUpdated: Date.now(),
    });
  },
});

export const clear = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query("cart")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
    if (cart) {
      await ctx.db.patch(cart._id, { items: [], lastUpdated: Date.now() });
    }
  },
});

export const getAbandoned = internalMutation({
  args: { olderThanMs: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const carts = await ctx.db.query("cart").collect();
    return carts.filter(
      (c) => c.items.length > 0 && c.lastUpdated < cutoff
    );
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("reviews")
      .withIndex("by_product_id", (q) => q.eq("productId", args.productId))
      .order("desc")
      .collect();
  },
});

export const averageRating = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_id", (q) => q.eq("productId", args.productId))
      .collect();
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / reviews.length, count: reviews.length };
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    orderId: v.optional(v.id("orders")),
    rating: v.number(),
    title: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    let verified = false;
    if (args.orderId) {
      const order = await ctx.db.get(args.orderId);
      verified =
        !!order &&
        order.userId === user._id &&
        order.status === "delivered" &&
        order.items.some((i) => i.productId === args.productId);
    }

    return ctx.db.insert("reviews", {
      userId: user._id,
      productId: args.productId,
      orderId: args.orderId,
      rating: args.rating,
      title: args.title,
      body: args.body,
      verified,
      helpful: 0,
    });
  },
});

export const markHelpful = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");
    await ctx.db.patch(args.id, { helpful: review.helpful + 1 });
  },
});

export const remove = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const review = await ctx.db.get(args.id);
    if (!review) throw new Error("Review not found");
    if (review.userId !== user._id && user.role !== "admin") {
      throw new Error("Forbidden");
    }
    await ctx.db.delete(args.id);
  },
});

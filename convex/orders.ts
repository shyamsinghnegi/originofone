import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const orderItemSchema = v.object({
  productId: v.id("products"),
  slug: v.string(),
  name: v.string(),
  price: v.number(),
  quantity: v.number(),
  color: v.string(),
  size: v.string(),
  image: v.string(),
});

const shippingAddressSchema = v.object({
  line1: v.string(),
  line2: v.optional(v.string()),
  city: v.string(),
  province: v.string(),
  postalCode: v.string(),
  country: v.string(),
});

async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  // Check JWT role claim first (populated by Clerk JWT template custom claim)
  const jwtRole = (identity as any).role;
  if (jwtRole === "admin") return { clerkId: identity.subject, role: "admin" };

  // Fall back to DB lookup
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
  if (!user || user.role !== "admin") throw new Error("Forbidden");
  return user;
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    return ctx.db
      .query("orders")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("processing"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled"),
        v.literal("refunded")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      return ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return ctx.db.query("orders").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const order = await ctx.db.get(args.id);
    if (!order) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    if (order.userId !== user._id && user.role !== "admin") {
      throw new Error("Forbidden");
    }
    return order;
  },
});

export const create = mutation({
  args: {
    items: v.array(orderItemSchema),
    shippingAddress: shippingAddressSchema,
    shippingMethod: v.string(),
    subtotal: v.number(),
    shippingCost: v.number(),
    tax: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    return ctx.db.insert("orders", {
      userId: user._id,
      status: "pending",
      ...args,
    });
  },
});

export const attachStripeIntent = internalMutation({
  args: {
    orderId: v.id("orders"),
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      stripePaymentIntentId: args.stripePaymentIntentId,
    });
  },
});

// Public so the Stripe webhook (Next.js route) can call it via ConvexHttpClient
export const markPaid = mutation({
  args: { stripePaymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .unique();
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(order._id, { status: "paid" });
    await ctx.runMutation(internal.cart.clear, { userId: order.userId });
    await ctx.runMutation(internal.products.decrementStock, {
      items: order.items.map((i) => ({
        productId: i.productId,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      })),
    });

    return order;
  },
});

export const markCancelled = mutation({
  args: { stripePaymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .unique();
    if (!order) return;
    await ctx.db.patch(order._id, { status: "cancelled" });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateTracking = mutation({
  args: {
    id: v.id("orders"),
    tracking: v.object({
      carrier: v.string(),
      trackingNumber: v.string(),
      url: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      tracking: args.tracking,
      status: "shipped",
    });
  },
});

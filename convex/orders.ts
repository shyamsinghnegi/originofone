import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

const ONE_HOUR_MS = 60 * 60 * 1000;

const SHIPPING_COSTS: Record<string, number> = {
  standard: 0,
  express: 14.99,
  overnight: 29.99,
};
const TAX_RATE = 0.13;

async function priceOrder(
  ctx: any,
  clientItems: Array<{
    productId: any;
    color: string;
    size: string;
    quantity: number;
  }>,
  shippingMethod: string
) {
  if (clientItems.length === 0) throw new Error("Cart is empty");

  const round = (n: number) => Math.round(n * 100) / 100;
  const items = [];
  let subtotal = 0;

  for (const ci of clientItems) {
    if (!Number.isInteger(ci.quantity) || ci.quantity < 1 || ci.quantity > 100) {
      throw new Error("Invalid quantity");
    }
    const product = await ctx.db.get(ci.productId);
    if (!product || !product.isActive) {
      throw new Error("Product not available");
    }
    const variant = product.variants.find(
      (val: any) => val.color === ci.color && val.size === ci.size
    );
    if (!variant) throw new Error("Selected variant does not exist");

    const price = product.price;
    subtotal += price * ci.quantity;

    items.push({
      productId: ci.productId,
      slug: product.slug,
      name: product.name,
      price,
      quantity: ci.quantity,
      color: ci.color,
      size: ci.size,
      image: product.images?.[0] ?? "",
    });
  }

  const shippingCost = SHIPPING_COSTS[shippingMethod];
  if (shippingCost === undefined) throw new Error("Invalid shipping method");

  subtotal = round(subtotal);
  const tax = round((subtotal + shippingCost) * TAX_RATE);
  const total = round(subtotal + shippingCost + tax);

  return { items, subtotal, shippingCost, tax, total };
}

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

const orderItemInputSchema = v.object({
  productId: v.id("products"),
  color: v.string(),
  size: v.string(),
  quantity: v.number(),
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

export const listMyPending = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
    return orders.filter((o) => o.status === "pending");
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
    items: v.array(orderItemInputSchema),
    shippingAddress: shippingAddressSchema,
    shippingMethod: v.string(),
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

    const priced = await priceOrder(ctx, args.items, args.shippingMethod);

    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      status: "pending",
      paymentDueAt: Date.now() + ONE_HOUR_MS,
      items: priced.items,
      shippingAddress: args.shippingAddress,
      shippingMethod: args.shippingMethod,
      subtotal: priced.subtotal,
      shippingCost: priced.shippingCost,
      tax: priced.tax,
      total: priced.total,
      notes: args.notes,
    });

    await ctx.scheduler.runAfter(
      10 * 60 * 1000,
      internal.orders.maybeSendPendingPaymentEmail,
      { orderId }
    );

    return orderId;
  },
});

export const maybeSendPendingPaymentEmail = internalMutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order || order.status !== "pending") return;
    const user = await ctx.db.get(order.userId);
    if (!user) return;
    await ctx.scheduler.runAfter(0, internal.actions.email.sendPendingPaymentEmail, {
      orderId: order._id,
      userEmail: user.email,
      userName: user.name,
      total: order.total,
    });
  },
});

export const deleteIfPending = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const order = await ctx.db.get(args.id);
    if (!order) return;
    if (order.userId !== user._id) throw new Error("Forbidden");
    if (order.status !== "pending" || order.stripePaymentIntentId) return;

    await ctx.db.delete(args.id);
  },
});

export const getForResume = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.userId !== user._id) throw new Error("Forbidden");
    if (order.status !== "pending") {
      throw new Error("This order can no longer be paid.");
    }
    return {
      amountInCents: Math.round(order.total * 100),
      items: order.items,
      shippingAddress: order.shippingAddress,
      shippingMethod: order.shippingMethod,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      total: order.total,
    };
  },
});

export const extendPaymentWindow = internalMutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order || order.status !== "pending") return;
    await ctx.db.patch(args.id, { paymentDueAt: Date.now() + ONE_HOUR_MS });
  },
});

export const expirePendingOrders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pending = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    let expired = 0;
    for (const order of pending) {
      if (order.paymentDueAt && order.paymentDueAt <= now) {
        await ctx.db.patch(order._id, { status: "failed" });
        expired++;
      }
    }
    return { expired };
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

async function fulfillOrder(ctx: any, orderId: any) {
  const order = await ctx.db.get(orderId);
  if (!order) return null;
  if (order.status !== "pending") return order;

  await ctx.db.patch(order._id, { status: "paid" });
  await ctx.runMutation(internal.cart.clear, { userId: order.userId });
  await ctx.runMutation(internal.products.decrementStock, {
    items: order.items.map((i: any) => ({
      productId: i.productId,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
    })),
  });
  return order;
}

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
    return fulfillOrder(ctx, order._id);
  },
});

export const markPaidByIntentId = mutation({
  args: { stripePaymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .unique();
    if (!order) throw new Error("Order not found");
    if (order.userId !== user._id) throw new Error("Forbidden");

    await fulfillOrder(ctx, order._id);
    return order._id;
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

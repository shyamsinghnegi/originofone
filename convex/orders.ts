import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
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

// For system-triggered calls (scheduled actions) that run with no end-user
// identity — the caller must have already authorized the request before
// scheduling, e.g. requestCancellation/requestReturn checking order ownership.
export const getByIdInternal = internalQuery({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => ctx.db.get(args.id),
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
      stripePaymentIntentId: order.stripePaymentIntentId,
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

  await ctx.db.patch(order._id, { status: "paid", paidAt: Date.now() });
  await ctx.runMutation(internal.cart.clear, { userId: order.userId });
  await ctx.runMutation(internal.products.decrementStock, {
    items: order.items.map((i: any) => ({
      productId: i.productId,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
    })),
  });
  await ctx.scheduler.runAfter(0, internal.actions.email.sendOrderConfirmation, {
    orderId: order._id,
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
    // No matching order — most likely a superseded PaymentIntent from a
    // resumed checkout (the order's stripePaymentIntentId was overwritten by
    // a newer intent). Nothing to fulfill; return quietly instead of
    // throwing so Stripe doesn't retry this webhook indefinitely.
    if (!order) return null;
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
    await ctx.scheduler.runAfter(0, internal.actions.email.sendShippingNotification, {
      orderId: args.id,
    });
  },
});

// Validates that a customer is allowed to self-serve cancel this order
// (nothing has shipped yet, so the refund is unambiguous) and returns what
// the client needs to trigger the actual Stripe refund action. The refund
// itself runs as a client-invoked action (src/app/account calls
// api.actions.stripe.refundOrder directly), matching how createPaymentIntent
// already works — keeps orders.ts from needing to reference actions/stripe.ts,
// which would otherwise create a circular type dependency between the two.
export const canCancel = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return false;

    const order = await ctx.db.get(args.id);
    if (!order || order.userId !== user._id) return false;
    return (
      (order.status === "paid" || order.status === "processing") &&
      !!order.stripePaymentIntentId
    );
  },
});

export const markRefunded = internalMutation({
  args: {
    orderId: v.id("orders"),
    cancelledBy: v.union(v.literal("customer"), v.literal("admin")),
    cancelReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: "refunded",
      cancelledBy: args.cancelledBy,
      cancelReason: args.cancelReason,
    });
  },
});

// Return/cancellation request for orders that have already shipped — this
// never touches money automatically. It just flags the order and notifies
// the admin, since a real judgment call (item condition, partial refund,
// etc.) is needed once something has left the building.
export const requestReturn = mutation({
  args: { id: v.id("orders"), reason: v.string() },
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
    if (order.status !== "shipped" && order.status !== "delivered") {
      throw new Error("Returns are only available for shipped orders.");
    }
    if (order.returnRequested) {
      throw new Error("A return has already been requested for this order.");
    }

    await ctx.db.patch(args.id, {
      returnRequested: true,
      returnReason: args.reason,
      returnRequestedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(0, internal.actions.email.sendReturnRequestNotification, {
      orderId: args.id,
      customerEmail: user.email,
      customerName: user.name,
      reason: args.reason,
    });
  },
});

// One-time backfill for orders paid before paidAt existed — approximates
// paidAt with _creationTime so historical orders still show up in analytics.
export const backfillPaidAt = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query("orders").collect();
    let updated = 0;
    for (const o of orders) {
      const isPaidStage =
        o.status === "paid" ||
        o.status === "processing" ||
        o.status === "shipped" ||
        o.status === "delivered";
      if (isPaidStage && o.paidAt === undefined) {
        await ctx.db.patch(o._id, { paidAt: o._creationTime });
        updated++;
      }
    }
    return { updated };
  },
});

export const analytics = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const allOrders = await ctx.db.query("orders").collect();
    const ordersInRange = allOrders.filter(
      (o) => o.paidAt !== undefined && o.paidAt >= args.startDate && o.paidAt <= args.endDate
    );

    // Gross = every order that was ever paid, in the period (regardless of
    // what happened to it since). Refunded = the subset later refunded.
    // Net = what actually stayed in the business — this is "Revenue" on the
    // dashboard, since a refunded order's paidAt sale shouldn't still count.
    const REVENUE_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);
    const paidOrders = ordersInRange.filter((o) => REVENUE_STATUSES.has(o.status));
    const refundedOrders = ordersInRange.filter((o) => o.status === "refunded");

    const grossRevenue = ordersInRange.reduce((sum, o) => sum + o.total, 0);
    const refundedAmount = refundedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalRevenue = grossRevenue - refundedAmount;
    const orderCount = paidOrders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    const revenueByDay = new Map<string, number>();
    for (const o of paidOrders) {
      const day = new Date(o.paidAt!).toISOString().slice(0, 10);
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + o.total);
    }
    for (const o of refundedOrders) {
      const day = new Date(o.paidAt!).toISOString().slice(0, 10);
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) - o.total);
    }
    const trend = Array.from(revenueByDay.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const statusBreakdown = new Map<string, number>();
    for (const o of allOrders) {
      if (o._creationTime < args.startDate || o._creationTime > args.endDate) continue;
      statusBreakdown.set(o.status, (statusBreakdown.get(o.status) ?? 0) + 1);
    }

    const productSales = new Map<string, { name: string; units: number; revenue: number }>();
    for (const o of paidOrders) {
      for (const item of o.items) {
        const key = item.productId;
        const existing = productSales.get(key) ?? { name: item.name, units: 0, revenue: 0 };
        existing.units += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(key, existing);
      }
    }
    const products = Array.from(productSales.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      grossRevenue,
      refundedAmount,
      totalRevenue,
      orderCount,
      avgOrderValue,
      trend,
      statusBreakdown: Array.from(statusBreakdown.entries()).map(([status, count]) => ({ status, count })),
      products,
    };
  },
});

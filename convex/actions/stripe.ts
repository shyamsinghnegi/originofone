"use node";
import Stripe from "stripe";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { api, internal } from "../_generated/api";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const createPaymentIntent = action({
  args: {
    convexOrderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{ clientSecret: string }> => {
    const order = await ctx.runQuery(api.orders.getForResume, {
      id: args.convexOrderId,
    });

    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: order.amountInCents,
      currency: "cad",
      automatic_payment_methods: { enabled: true },
      metadata: { convexOrderId: args.convexOrderId },
    });

    await ctx.runMutation(internal.orders.attachStripeIntent, {
      orderId: args.convexOrderId,
      stripePaymentIntentId: intent.id,
    });

    return { clientSecret: intent.client_secret! };
  },
});

// Statuses where the intent still needs a payment attempt and is safe to
// reuse — anything else (succeeded, canceled, processing) needs a fresh one.
const REUSABLE_INTENT_STATUSES = new Set([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
]);

export const resumePaymentIntent = action({
  args: { convexOrderId: v.id("orders") },
  handler: async (ctx, args): Promise<{ clientSecret: string }> => {
    const order = await ctx.runQuery(api.orders.getForResume, {
      id: args.convexOrderId,
    });

    const stripe = getStripe();

    // Reuse the order's existing PaymentIntent if it's still awaiting payment,
    // instead of always minting a new one — visiting/reloading a resume link
    // repeatedly previously created a new intent each time, and whichever one
    // got attached last could silently orphan an intent the customer was
    // actually paying through (the stored ID no longer matched the real charge).
    if (order.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      if (REUSABLE_INTENT_STATUSES.has(existing.status)) {
        await ctx.runMutation(internal.orders.extendPaymentWindow, {
          id: args.convexOrderId,
        });
        return { clientSecret: existing.client_secret! };
      }
    }

    const intent = await stripe.paymentIntents.create({
      amount: order.amountInCents,
      currency: "cad",
      automatic_payment_methods: { enabled: true },
      metadata: { convexOrderId: args.convexOrderId },
    });

    await ctx.runMutation(internal.orders.attachStripeIntent, {
      orderId: args.convexOrderId,
      stripePaymentIntentId: intent.id,
    });
    await ctx.runMutation(internal.orders.extendPaymentWindow, {
      id: args.convexOrderId,
    });

    return { clientSecret: intent.client_secret! };
  },
});

// Refund entry point, called directly by the client (same shape as
// createPaymentIntent) — runs with the caller's identity, so
// api.orders.getById already enforces that only the order's owner (or an
// admin) can trigger this. Self-serve customer cancellation is only allowed
// pre-shipment (unambiguous — nothing to un-ship). An admin can additionally
// refund a shipped/delivered order, e.g. approving a return request, which
// is exactly the judgment call that shouldn't be automatic for customers.
export const refundOrder = action({
  args: { orderId: v.id("orders"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const isAdmin = await ctx.runQuery(api.users.isAdmin, {});
    const order = await ctx.runQuery(api.orders.getById, { id: args.orderId });
    if (!order) throw new Error("Order not found");

    const preShipment = order.status === "paid" || order.status === "processing";
    const postShipment = order.status === "shipped" || order.status === "delivered";
    if (!preShipment && !(isAdmin && postShipment)) {
      throw new Error("This order can no longer be cancelled online.");
    }
    if (!order.stripePaymentIntentId) {
      throw new Error("No payment on file for this order.");
    }

    const stripe = getStripe();
    await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
    });

    await ctx.runMutation(internal.orders.markRefunded, {
      orderId: args.orderId,
      cancelledBy: isAdmin ? "admin" : "customer",
      cancelReason: args.reason,
    });

    await ctx.runAction(internal.actions.email.sendRefundConfirmation, {
      orderId: args.orderId,
    });
  },
});

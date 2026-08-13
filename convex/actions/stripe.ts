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

export const resumePaymentIntent = action({
  args: { convexOrderId: v.id("orders") },
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
    await ctx.runMutation(internal.orders.extendPaymentWindow, {
      id: args.convexOrderId,
    });

    return { clientSecret: intent.client_secret! };
  },
});

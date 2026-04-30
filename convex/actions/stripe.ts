"use node";
import Stripe from "stripe";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const createPaymentIntent = action({
  args: {
    convexOrderId: v.id("orders"),
    amountInCents: v.number(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: args.amountInCents,
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

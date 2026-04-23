import Razorpay from "razorpay";
import crypto from "crypto";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { internal } from "../_generated/api";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export const createOrder = action({
  args: {
    convexOrderId: v.id("orders"),
    amountInPaise: v.number(),
  },
  handler: async (ctx, args) => {
    const razorpay = getRazorpay();

    const rzpOrder = await razorpay.orders.create({
      amount: args.amountInPaise,
      currency: "INR",
      receipt: args.convexOrderId,
    });

    await ctx.runMutation(internal.orders.attachRazorpayOrder, {
      orderId: args.convexOrderId,
      razorpayOrderId: rzpOrder.id,
    });

    return {
      razorpayOrderId: rzpOrder.id,
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  },
});

export const verifyPayment = action({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.string(),
    razorpaySignature: v.string(),
  },
  handler: async (ctx, args) => {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${args.razorpayOrderId}|${args.razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== args.razorpaySignature) {
      throw new Error("Invalid payment signature");
    }

    const order = await ctx.runMutation(internal.orders.markPaid, {
      razorpayOrderId: args.razorpayOrderId,
      razorpayPaymentId: args.razorpayPaymentId,
    });

    await ctx.runAction(internal.actions.email.sendOrderConfirmation, {
      orderId: order._id,
    });

    return { success: true };
  },
});

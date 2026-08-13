"use node";
import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

async function sendEmail(
  resend: Resend,
  payload: { from: string; to: string; subject: string; text: string }
) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error("Resend send failed:", JSON.stringify(error));
    throw new Error(`Email send failed: ${error.message ?? error.name}`);
  }
  return data;
}

const FROM_ORDERS =
  process.env.EMAIL_FROM_ORDERS ?? "Origin of One <onboarding@resend.dev>";
const FROM_HELLO =
  process.env.EMAIL_FROM_HELLO ?? "Origin of One <onboarding@resend.dev>";

export const sendOrderConfirmation = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(api.orders.getById, {
      id: args.orderId,
    });
    if (!order) return;

    const user = await ctx.runQuery(api.users.getByClerkId, {
      clerkId: order.userId as any,
    });
    if (!user) return;

    const resend = getResend();
    const itemsList = order.items
      .map((i: any) => `${i.name} (${i.color}, ${i.size}) × ${i.quantity} — $${i.price.toFixed(2)}`)
      .join("\n");

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: user.email,
      subject: `Order Confirmed — #${args.orderId.slice(-8).toUpperCase()}`,
      text: [
        `Hi ${user.name ?? "there"},`,
        "",
        "Thanks for your order! Here's a summary:",
        "",
        itemsList,
        "",
        `Subtotal: $${order.subtotal.toFixed(2)}`,
        `Shipping: $${order.shippingCost.toFixed(2)}`,
        `Tax: $${order.tax.toFixed(2)}`,
        `Total: $${order.total.toFixed(2)}`,
        "",
        `Shipping to: ${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`,
        "",
        "We'll send another email when your order ships.",
        "",
        "— Origin of One",
      ].join("\n"),
    });
  },
});

export const sendPendingPaymentEmail = internalAction({
  args: {
    orderId: v.id("orders"),
    userEmail: v.string(),
    userName: v.optional(v.string()),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const resend = getResend();
    const siteUrl = process.env.SITE_URL ?? "https://originofone.ca";
    const resumeLink = `${siteUrl}/checkout?resume=${args.orderId}`;

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: args.userEmail,
      subject: "Complete your payment — your order is reserved",
      text: [
        `Hi ${args.userName ?? "there"},`,
        "",
        `Your order (total $${args.total.toFixed(2)} CAD) is reserved but the payment wasn't completed.`,
        "",
        "Complete your payment within 1 hour to secure your order:",
        resumeLink,
        "",
        "After that, the reservation is released and the order is cancelled.",
        "",
        "— Origin of One",
      ].join("\n"),
    });
  },
});

export const sendAbandonedCartEmail = internalAction({
  args: {
    userEmail: v.string(),
    userName: v.optional(v.string()),
    itemCount: v.number(),
  },
  handler: async (ctx, args) => {
    const resend = getResend();
    await sendEmail(resend, {
      from: FROM_HELLO,
      to: args.userEmail,
      subject: "You left something behind",
      text: [
        `Hi ${args.userName ?? "there"},`,
        "",
        `You left ${args.itemCount} item${args.itemCount !== 1 ? "s" : ""} in your cart.`,
        "Your selection is still waiting for you.",
        "",
        "Complete your order: https://originofone.ca/cart",
        "",
        "— Origin of One",
      ].join("\n"),
    });
  },
});

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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
};

export const sendOrderConfirmation = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.orders.getByIdInternal, {
      id: args.orderId,
    });
    if (!order) return;

    const user = await ctx.runQuery(api.users.getUserById, { id: order.userId });
    if (!user) return;

    const resend = getResend();
    const orderNumber = args.orderId.slice(-8).toUpperCase();
    const itemsList = order.items
      .map((i: any) => `${i.name} (${i.color}, ${i.size}) × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`)
      .join("\n");

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: user.email,
      subject: `Order Confirmed — #${orderNumber}`,
      text: [
        `Hi ${user.name ?? "there"},`,
        "",
        "Thanks for your order! Here's a summary:",
        "",
        `Order #: ${orderNumber}`,
        `Status: ${STATUS_LABELS[order.status] ?? order.status}`,
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
        order.tracking
          ? `Track your order: ${order.tracking.url}`
          : "We'll send another email with tracking once your order ships.",
        "",
        "— Origin of One",
      ].join("\n"),
    });
  },
});

export const sendShippingNotification = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.orders.getByIdInternal, { id: args.orderId });
    if (!order || !order.tracking) return;

    const user = await ctx.runQuery(api.users.getUserById, { id: order.userId });
    if (!user) return;

    const resend = getResend();
    const orderNumber = args.orderId.slice(-8).toUpperCase();

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: user.email,
      subject: `Your order has shipped — #${orderNumber}`,
      text: [
        `Hi ${user.name ?? "there"},`,
        "",
        `Order #${orderNumber} is on its way!`,
        "",
        `Status: ${STATUS_LABELS[order.status] ?? order.status}`,
        `Carrier: ${order.tracking.carrier}`,
        `Tracking Number: ${order.tracking.trackingNumber}`,
        `Track your order: ${order.tracking.url}`,
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

export const sendRefundConfirmation = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.orders.getByIdInternal, { id: args.orderId });
    if (!order) return;

    const user = await ctx.runQuery(api.users.getUserById, { id: order.userId });
    if (!user) return;

    const resend = getResend();
    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: user.email,
      subject: `Order Cancelled & Refunded — #${args.orderId.slice(-8).toUpperCase()}`,
      text: [
        `Hi ${user.name ?? "there"},`,
        "",
        `Your order #${args.orderId.slice(-8).toUpperCase()} has been cancelled and a full refund of $${order.total.toFixed(2)} CAD has been issued to your original payment method.`,
        "",
        "Refunds typically take 5–10 business days to appear on your statement.",
        "",
        "— Origin of One",
      ].join("\n"),
    });
  },
});

export const sendReturnRequestNotification = internalAction({
  args: {
    orderId: v.id("orders"),
    customerEmail: v.string(),
    customerName: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    if (!ADMIN_EMAIL) {
      console.error("ADMIN_EMAIL is not set — skipping return request notification.");
      return;
    }
    const resend = getResend();
    await sendEmail(resend, {
      from: FROM_HELLO,
      to: ADMIN_EMAIL,
      subject: `Return requested — #${args.orderId.slice(-8).toUpperCase()}`,
      text: [
        `Order #${args.orderId.slice(-8).toUpperCase()} has a return request.`,
        "",
        `Customer: ${args.customerName ?? "—"} (${args.customerEmail})`,
        `Reason: ${args.reason}`,
        "",
        `Review it in the admin panel: https://originofone.ca/admin/orders`,
      ].join("\n"),
    });
  },
});

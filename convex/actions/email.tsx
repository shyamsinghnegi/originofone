"use node";
import * as React from "react";
import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { render } from "@react-email/render";

import { OrderConfirmationEmail } from "../emails/OrderConfirmation";
import { ShippingNotificationEmail } from "../emails/ShippingNotification";
import { PendingPaymentEmail } from "../emails/PendingPayment";
import { AbandonedCartEmail } from "../emails/AbandonedCart";
import { RefundConfirmationEmail } from "../emails/RefundConfirmation";
import { ReturnNotificationEmail } from "../emails/ReturnNotification";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

async function sendEmail(
  resend: Resend,
  payload: { from: string; to: string; subject: string; html: string; text?: string }
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

    // Use synchronous render from @react-email/render
    const html = await render(
      <OrderConfirmationEmail
        orderNumber={orderNumber}
        userName={user.name ?? "there"}
        status={STATUS_LABELS[order.status] ?? order.status}
        items={order.items.map((i: any) => ({
          name: i.name,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
        }))}
        subtotal={order.subtotal}
        shippingCost={order.shippingCost}
        tax={order.tax}
        total={order.total}
        shippingAddress={{
          line1: order.shippingAddress.line1,
          city: order.shippingAddress.city,
          province: order.shippingAddress.province,
        }}
        trackingUrl={order.tracking?.url}
        userEmail={user.email}
      />
    );

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: user.email,
      subject: `Order Confirmed — #${orderNumber}`,
      html,
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

    const html = await render(
      <ShippingNotificationEmail
        orderNumber={orderNumber}
        userName={user.name ?? "there"}
        status={STATUS_LABELS[order.status] ?? order.status}
        carrier={order.tracking.carrier}
        trackingNumber={order.tracking.trackingNumber}
        trackingUrl={order.tracking.url}
        userEmail={user.email}
      />
    );

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: user.email,
      subject: `Your order has shipped — #${orderNumber}`,
      html,
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
    const orderNumber = args.orderId.slice(-8).toUpperCase();

    const html = await render(
      <PendingPaymentEmail
        orderNumber={orderNumber}
        userName={args.userName ?? "there"}
        total={args.total}
        resumeLink={resumeLink}
        userEmail={args.userEmail}
      />
    );

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: args.userEmail,
      subject: "Complete your payment — your order is reserved",
      html,
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
    const siteUrl = process.env.SITE_URL ?? "https://originofone.ca";
    const cartUrl = `${siteUrl}/cart`;

    const html = await render(
      <AbandonedCartEmail
        userName={args.userName ?? "there"}
        itemCount={args.itemCount}
        cartUrl={cartUrl}
        userEmail={args.userEmail}
      />
    );

    await sendEmail(resend, {
      from: FROM_HELLO,
      to: args.userEmail,
      subject: "You left something behind",
      html,
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
    const orderNumber = args.orderId.slice(-8).toUpperCase();

    const html = await render(
      <RefundConfirmationEmail
        orderNumber={orderNumber}
        userName={user.name ?? "there"}
        total={order.total}
        userEmail={user.email}
      />
    );

    await sendEmail(resend, {
      from: FROM_ORDERS,
      to: user.email,
      subject: `Order Cancelled & Refunded — #${orderNumber}`,
      html,
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
    const orderNumber = args.orderId.slice(-8).toUpperCase();
    const siteUrl = process.env.SITE_URL ?? "https://originofone.ca";
    const adminUrl = `${siteUrl}/admin/orders`;

    const html = await render(
      <ReturnNotificationEmail
        orderNumber={orderNumber}
        customerName={args.customerName ?? "—"}
        customerEmail={args.customerEmail}
        reason={args.reason}
        adminUrl={adminUrl}
      />
    );

    await sendEmail(resend, {
      from: FROM_HELLO,
      to: ADMIN_EMAIL,
      subject: `Return requested — #${orderNumber}`,
      html,
    });
  },
});

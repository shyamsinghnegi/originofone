import { Resend } from "resend";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export const sendOrderConfirmation = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.runQuery(internal.orders.getById, {
      id: args.orderId,
    });
    if (!order) return;

    const user = await ctx.runQuery(internal.users.getByClerkId, {
      clerkId: order.userId as any,
    });
    if (!user) return;

    const resend = getResend();
    const itemsList = order.items
      .map((i: any) => `${i.name} (${i.color}, ${i.size}) × ${i.quantity} — $${i.price.toFixed(2)}`)
      .join("\n");

    await resend.emails.send({
      from: "Origin of One <orders@originofone.ca>",
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

export const sendAbandonedCartEmail = internalAction({
  args: {
    userEmail: v.string(),
    userName: v.optional(v.string()),
    itemCount: v.number(),
  },
  handler: async (ctx, args) => {
    const resend = getResend();
    await resend.emails.send({
      from: "Origin of One <hello@originofone.ca>",
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

import crypto from "crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type RazorpayWebhookEvent = {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        status: string;
      };
    };
  };
};

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "No webhook secret" }, { status: 500 });

  const headerPayload = await headers();
  const signature = headerPayload.get("x-razorpay-signature");
  const body = await req.text();

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event: RazorpayWebhookEvent = JSON.parse(body);
  const payment = event.payload.payment.entity;

  if (event.event === "payment.captured") {
    await client.mutation(api.orders.markPaid, {
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
    });
  } else if (
    event.event === "payment.failed" ||
    event.event === "order.paid" === false
  ) {
    await client.mutation(api.orders.markCancelled, {
      razorpayOrderId: payment.order_id,
    });
  }

  return NextResponse.json({ received: true });
}

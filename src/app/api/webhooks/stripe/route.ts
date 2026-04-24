import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const headerPayload = await headers();
  const sig = headerPayload.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await client.mutation(api.orders.markPaid, { stripePaymentIntentId: intent.id });
  } else if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    await client.mutation(api.orders.markCancelled, { stripePaymentIntentId: intent.id });
  }

  return NextResponse.json({ received: true });
}

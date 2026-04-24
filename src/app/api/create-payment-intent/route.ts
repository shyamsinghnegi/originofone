import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { amountInCents } = await req.json();
  if (!amountInCents || amountInCents < 50) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const intent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "cad",
    automatic_payment_methods: { enabled: true },
  });

  return NextResponse.json({ clientSecret: intent.client_secret });
}

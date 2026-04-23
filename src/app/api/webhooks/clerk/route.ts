import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ClerkUserEvent = {
  type: "user.created" | "user.updated" | "user.deleted";
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name?: string;
    last_name?: string;
  };
};

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "No webhook secret" }, { status: 500 });

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.text();
  const wh = new Webhook(secret);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = event;
  const email = data.email_addresses?.[0]?.email_address;
  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined;

  if (type === "user.created") {
    await client.mutation(api.users.create, {
      clerkId: data.id,
      email,
      name,
    });
  } else if (type === "user.updated") {
    await client.mutation(api.users.update, {
      clerkId: data.id,
      email,
      name,
    });
  } else if (type === "user.deleted") {
    await client.mutation(api.users.deleteByClerkId, { clerkId: data.id });
  }

  return NextResponse.json({ received: true });
}

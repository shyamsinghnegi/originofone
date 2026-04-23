import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, contentType } = await req.json();
  if (!fileName || !contentType) {
    return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(contentType)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const result = await client.action(api.actions.r2.getPresignedUploadUrl, {
    fileName,
    contentType,
  });

  return NextResponse.json(result);
}

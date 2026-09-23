import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

export async function POST(req: Request) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getToken({ template: "convex" });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileName, contentType } = await req.json();
  if (!fileName || !contentType) {
    return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(contentType)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  client.setAuth(token);

  try {
    const result = await client.action(api.actions.r2.getPresignedUploadUrl, {
      fileName,
      contentType,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Forbidden";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}




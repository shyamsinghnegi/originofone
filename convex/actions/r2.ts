"use node";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";

function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
  });
}

export const getPresignedUploadUrl = action({
  args: {
    fileName: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const key = `products/${Date.now()}-${args.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const client = getS3Client();

    const url = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
        ContentType: args.contentType,
      }),
      { expiresIn: 300 }
    );

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
    return { uploadUrl: url, publicUrl };
  },
});

export const deleteImage = internalAction({
  args: { publicUrl: v.string() },
  handler: async (ctx, args) => {
    const base = process.env.CLOUDFLARE_R2_PUBLIC_URL!;
    const key = args.publicUrl.replace(`${base}/`, "");
    const client = getS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: key,
      })
    );
  },
});

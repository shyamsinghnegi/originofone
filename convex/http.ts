import { httpRouter } from "convex/server";

// Webhooks from Clerk and Razorpay are handled in Next.js API routes
// (src/app/api/webhooks/*) so they can verify signatures before calling
// internal Convex mutations via ConvexHttpClient.
// Add Convex HTTP endpoints here only if you need direct inbound webhooks
// that bypass Next.js entirely.

const http = httpRouter();

export default http;

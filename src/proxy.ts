import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isProtectedRoute = createRouteMatcher([
  "/account(.*)",
  "/checkout(.*)",
  "/confirmation(.*)",
]);

const isDev = process.env.NODE_ENV === "development";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // 'strict-dynamic' propagates nonce trust to dynamically loaded scripts
    // (Clerk, Stripe, and Convex all inject scripts via JS, so they inherit trust)
    // Host allowlist kept as fallback for browsers that don't support strict-dynamic
    // 'unsafe-eval' is only included in dev: React uses eval() for call-stack debugging
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://*.clerk.accounts.dev https://js.stripe.com`,
    // unsafe-inline required for style attributes (React inline styles → style="...")
    "style-src 'self' 'unsafe-inline'",
    // Fonts are self-hosted via next/font — no external font CDN needed
    "font-src 'self'",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://*.r2.dev https://*.r2.cloudflarestorage.com https://img.clerk.com",
    "connect-src 'self' wss://*.convex.cloud https://*.convex.cloud https://*.clerk.accounts.dev https://clerk.accounts.dev https://api.stripe.com wss://ppm.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev",
    "frame-ancestors 'none'",
    "worker-src blob: 'self'",
  ].join("; ");
}

function applySecurityHeaders(res: NextResponse, nonce: string): NextResponse {
  res.headers.set("Content-Security-Policy", buildCsp(nonce));
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return res;
}

export default clerkMiddleware(async (auth, req) => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  if (isAdminRoute(req) || isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const redirect = NextResponse.redirect(new URL("/sign-in", req.url));
      return applySecurityHeaders(redirect, nonce);
    }
  }

  // Inject nonce into request headers so Next.js applies it to its generated
  // <script nonce="..."> tags automatically (App Router reads x-nonce)
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  return applySecurityHeaders(response, nonce);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

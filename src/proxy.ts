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
  // Scripts: nonce covers our own inline scripts; the explicit host allowlist
  // covers third-party SDKs that inject their own <script> tags (Clerk, Stripe,
  // Cloudflare Turnstile). 'strict-dynamic' is intentionally NOT used: Clerk's
  // App Router integration loads clerk.browser.js as a browser-parsed script
  // without the middleware nonce, and 'strict-dynamic' disables the host
  // allowlist, which would block it. 'unsafe-eval' is dev-only (React debugging).
  const scriptSrc =
    `script-src 'self' 'nonce-${nonce}'${isDev ? " 'unsafe-eval'" : ""} ` +
    "https://*.clerk.accounts.dev https://js.stripe.com https://challenges.cloudflare.com";

  return [
    "default-src 'self'",
    scriptSrc,
    // Some browsers use script-src-elem for <script> element loads; mirror it
    // explicitly so the host allowlist is honored for injected SDK scripts.
    `script-src-elem 'self' 'nonce-${nonce}' https://*.clerk.accounts.dev https://js.stripe.com https://challenges.cloudflare.com`,
    // unsafe-inline required for style attributes (React inline styles → style="...")
    "style-src 'self' 'unsafe-inline'",
    // Fonts are self-hosted via next/font — no external font CDN needed
    "font-src 'self'",
    "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://*.r2.dev https://*.r2.cloudflarestorage.com https://img.clerk.com",
    "connect-src 'self' wss://*.convex.cloud https://*.convex.cloud https://*.clerk.accounts.dev https://clerk.accounts.dev https://api.stripe.com wss://ppm.stripe.com https://challenges.cloudflare.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
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

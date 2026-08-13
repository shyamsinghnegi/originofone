"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

// Admin access is gated on the Convex users.role field (single source of truth),
// matching the backend requireAdmin checks. Non-admins are redirected out.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const admin = useQuery(api.users.isAdmin, isAuthenticated ? {} : "skip");

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/sign-in");
    } else if (admin === false) {
      router.replace("/unauthorized");
    }
  }, [isLoading, isAuthenticated, admin, router]);

  // While auth/role is resolving, or a redirect is pending, show nothing.
  if (isLoading || admin === undefined || admin === false || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-[--color-border] shrink-0 py-8 px-6 flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[--color-muted] mb-4">
          Admin
        </p>
        {[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/products", label: "Products" },
          { href: "/admin/orders", label: "Orders" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="text-sm py-2 px-3 rounded hover:bg-[--color-border] transition-colors"
          >
            {label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}

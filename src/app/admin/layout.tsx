import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

// Role check is also enforced in middleware; this is a defence-in-depth guard.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as any)?.role;
  if (role !== "admin") redirect("/");

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

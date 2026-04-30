import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // currentUser() fetches fresh data including publicMetadata (not cached in JWT)
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const role = (user.publicMetadata as any)?.role;
  if (role !== "admin") redirect("/unauthorized");

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

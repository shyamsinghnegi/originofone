"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

export default function AdminDashboard() {
  const orders = useQuery(api.orders.listAll, {});
  const products = useQuery(api.products.listAdmin, {});

  const stats = orders
    ? {
        total: orders.length,
        paid: orders.filter((o) => o.status === "paid").length,
        processing: orders.filter((o) => o.status === "processing").length,
        shipped: orders.filter((o) => o.status === "shipped").length,
        revenue: orders
          .filter((o) => o.status !== "cancelled" && o.status !== "pending")
          .reduce((sum, o) => sum + o.total, 0),
      }
    : null;

  return (
    <div>
      <h1 className="text-2xl font-[--font-editorial] mb-8">Dashboard</h1>
      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Orders", value: stats.total },
            { label: "Processing", value: stats.processing },
            { label: "Shipped", value: stats.shipped },
            {
              label: "Revenue",
              value: `$${stats.revenue.toFixed(2)}`,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="border border-[--color-border] rounded-lg p-4"
            >
              <p className="text-xs text-[--color-muted] mb-1">{label}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[--color-muted] text-sm">Loading...</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[--color-border] rounded-lg p-4">
          <p className="text-xs text-[--color-muted] mb-1">Active Products</p>
          <p className="text-2xl font-semibold">
            {products?.filter((p) => p.isActive).length ?? "—"}
          </p>
        </div>
        <div className="border border-[--color-border] rounded-lg p-4">
          <p className="text-xs text-[--color-muted] mb-1">Orders Awaiting Payment</p>
          <p className="text-2xl font-semibold">
            {orders?.filter((o) => o.status === "pending").length ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

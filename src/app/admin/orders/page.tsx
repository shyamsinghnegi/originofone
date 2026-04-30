"use client";

import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

const STATUS_OPTIONS = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

type StatusFilter =
  | "all"
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export default function AdminOrdersPage() {
  const { isAuthenticated } = useConvexAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [trackingOrderId, setTrackingOrderId] = useState<Id<"orders"> | null>(null);
  const [tracking, setTracking] = useState({ carrier: "", trackingNumber: "", url: "" });

  const orders = useQuery(
    api.orders.listAll,
    isAuthenticated ? (statusFilter === "all" ? {} : { status: statusFilter as any }) : "skip"
  );
  const updateStatus = useMutation(api.orders.updateStatus);
  const updateTracking = useMutation(api.orders.updateTracking);

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };

  async function handleStatusChange(id: Id<"orders">, status: (typeof STATUS_OPTIONS)[number]) {
    await updateStatus({ id, status });
  }

  async function handleTrackingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingOrderId) return;
    await updateTracking({ id: trackingOrderId, tracking });
    setTrackingOrderId(null);
    setTracking({ carrier: "", trackingNumber: "", url: "" });
  }

  return (
    <div>
      <h1 className="text-2xl font-[--font-editorial] mb-8">Orders</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {(["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as StatusFilter[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                statusFilter === s
                  ? "bg-[--color-ink] text-[--color-paper] border-[--color-ink]"
                  : "border-[--color-border]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          )
        )}
      </div>

      {trackingOrderId && (
        <form
          onSubmit={handleTrackingSubmit}
          className="border border-[--color-border] rounded-lg p-4 mb-6 grid gap-2"
        >
          <p className="text-sm font-medium">Add Tracking</p>
          {[
            { label: "Carrier", key: "carrier" as const },
            { label: "Tracking Number", key: "trackingNumber" as const },
            { label: "Tracking URL", key: "url" as const },
          ].map(({ label, key }) => (
            <label key={key} className="grid gap-1">
              <span className="text-xs text-[--color-muted]">{label}</span>
              <input
                required
                className="border border-[--color-border] rounded px-3 py-1.5 text-sm outline-none focus:border-[--color-ink]"
                value={tracking[key]}
                onChange={(e) => setTracking((t) => ({ ...t, [key]: e.target.value }))}
              />
            </label>
          ))}
          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              className="bg-[--color-ink] text-[--color-paper] text-sm px-4 py-1.5 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setTrackingOrderId(null)}
              className="text-sm px-4 py-1.5 border border-[--color-border] rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-3">
        {orders?.map((order: any) => (
          <div
            key={order._id}
            className="border border-[--color-border] rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-sm font-medium">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-[--color-muted]">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""} ·
                  ${order.total.toFixed(2)}
                </p>
                <p className="text-xs text-[--color-muted] mt-0.5">
                  {order.shippingAddress.city}, {order.shippingAddress.province}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  STATUS_COLORS[order.status] ?? ""
                }`}
              >
                {order.status}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  disabled={order.status === s}
                  onClick={() => handleStatusChange(order._id, s)}
                  className="text-xs px-2 py-1 border border-[--color-border] rounded disabled:opacity-40"
                >
                  → {s}
                </button>
              ))}
              <button
                onClick={() => setTrackingOrderId(order._id)}
                className="text-xs px-2 py-1 border border-[--color-border] rounded"
              >
                Add Tracking
              </button>
            </div>
            {order.tracking && (
              <p className="text-xs text-[--color-muted] mt-2">
                {order.tracking.carrier} · {order.tracking.trackingNumber}
              </p>
            )}
          </div>
        ))}
        {orders?.length === 0 && (
          <p className="text-sm text-[--color-muted]">No orders found.</p>
        )}
      </div>
    </div>
  );
}

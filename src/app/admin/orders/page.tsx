"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useAction, useConvexAuth } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

const STATUS_OPTIONS = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

// Only offer the transitions that make sense from the order's current status,
// instead of showing all 5 options regardless of relevance.
// "shipped" is reached only via Add Tracking (which sets status + tracking
// together) — never offered as a bare status change with no tracking info.
const NEXT_STATUSES: Record<string, (typeof STATUS_OPTIONS)[number][]> = {
  pending: [],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

type StatusFilter =
  | "all"
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function AdminOrdersPage() {
  const { isAuthenticated } = useConvexAuth();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<Id<"orders"> | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<Id<"orders"> | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<Id<"orders"> | null>(null);
  const [tracking, setTracking] = useState({ carrier: "", trackingNumber: "", url: "" });

  const orders = useQuery(
    api.orders.listAll,
    isAuthenticated ? (statusFilter === "all" ? {} : { status: statusFilter as any }) : "skip"
  );
  const updateStatus = useMutation(api.orders.updateStatus);
  const updateTracking = useMutation(api.orders.updateTracking);
  const refundOrder = useAction(api.actions.stripe.refundOrder);
  const [refundError, setRefundError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!orders) return orders;
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o: any) =>
        o._id.toLowerCase().includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q) ||
        o.shippingAddress.province.toLowerCase().includes(q)
    );
  }, [orders, search]);

  async function handleStatusChange(id: Id<"orders">, status: (typeof STATUS_OPTIONS)[number]) {
    setMenuOpenId(null);
    if (status === "refunded") {
      if (!confirm("Refund this order in full via Stripe? This cannot be undone.")) return;
      setRefundError(null);
      try {
        await refundOrder({ orderId: id });
      } catch (e) {
        setRefundError(e instanceof Error ? e.message : "Refund failed.");
      }
      return;
    }
    await updateStatus({ id, status });
  }

  async function handleTrackingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingOrderId) return;
    await updateTracking({ id: trackingOrderId, tracking });
    setTrackingOrderId(null);
    setTracking({ carrier: "", trackingNumber: "", url: "" });
  }

  function toggleExpand(id: Id<"orders">) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  function toggleMenu(e: React.MouseEvent, id: Id<"orders">) {
    e.stopPropagation();
    setMenuOpenId((cur) => (cur === id ? null : id));
  }

  return (
    <div onClick={() => setMenuOpenId(null)}>
      <h1 className="text-2xl font-[--font-editorial] mb-6">Orders</h1>

      {refundError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
          {refundError}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as StatusFilter[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  statusFilter === s
                    ? "bg-ink text-paper border-ink"
                    : "border-border"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            )
          )}
        </div>
        <input
          type="text"
          placeholder="Search order # or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-border rounded-full px-4 py-1.5 outline-none focus:border-ink w-64"
        />
      </div>

      <div className="border border-border rounded-lg overflow-visible">
        <div className="grid grid-cols-[1fr_1.3fr_1fr_0.8fr_0.8fr_36px] gap-3 px-4 py-2.5 text-xs text-muted font-medium border-b border-border bg-border/20">
          <span>Order</span>
          <span>Location</span>
          <span>Items</span>
          <span className="text-right">Total</span>
          <span>Status</span>
          <span />
        </div>

        {filtered?.map((order: any) => {
          const isExpanded = expandedId === order._id;
          const isMenuOpen = menuOpenId === order._id;
          const nextStatuses = NEXT_STATUSES[order.status] ?? [];
          const canAddTracking = order.status === "paid" || order.status === "processing";

          return (
            <div key={order._id} className="border-b border-border last:border-0 relative">
              <div
                onClick={() => toggleExpand(order._id)}
                className="w-full grid grid-cols-[1fr_1.3fr_1fr_0.8fr_0.8fr_36px] gap-3 px-4 py-3 text-sm items-center hover:bg-border/10 transition-colors cursor-pointer"
              >
                <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
                <span className="text-muted truncate">
                  {order.shippingAddress.city}, {order.shippingAddress.province}
                </span>
                <span className="text-muted">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </span>
                <span className="text-right font-medium">${order.total.toFixed(2)}</span>
                <span className="flex items-center gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                    {order.status}
                  </span>
                  {order.returnRequested && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-800">
                      Return
                    </span>
                  )}
                </span>
                <button
                  onClick={(e) => toggleMenu(e, order._id)}
                  aria-label="Order actions"
                  className="justify-self-end w-7 h-7 flex items-center justify-center rounded hover:bg-border/40 text-muted hover:text-ink transition-colors"
                >
                  ⚙
                </button>
              </div>

              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-4 top-12 z-20 bg-white border border-border rounded-lg shadow-lg py-1 w-44"
                >
                  {nextStatuses.length === 0 && !canAddTracking ? (
                    <p className="text-xs text-muted px-3 py-2">No actions available.</p>
                  ) : (
                    <>
                      {nextStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(order._id, s)}
                          className="w-full text-left text-sm px-3 py-1.5 hover:bg-border/20 transition-colors capitalize"
                        >
                          Mark as {s}
                        </button>
                      ))}
                      {canAddTracking && (
                        <button
                          onClick={() => {
                            setTrackingOrderId(order._id);
                            setMenuOpenId(null);
                            setExpandedId(order._id);
                          }}
                          className="w-full text-left text-sm px-3 py-1.5 hover:bg-border/20 transition-colors border-t border-border"
                        >
                          Mark as Shipped...
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-border/10">
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted mb-3">
                    <div>
                      <p className="font-medium text-ink mb-1">Items</p>
                      {order.items.map((item: any, i: number) => (
                        <p key={i}>
                          {item.quantity}× {item.name} — {item.color}, {item.size}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="font-medium text-ink mb-1">Shipping Address</p>
                      <p>{order.shippingAddress.line1}</p>
                      {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>

                  {order.tracking && (
                    <p className="text-xs text-muted">
                      Tracking: {order.tracking.carrier} · {order.tracking.trackingNumber}
                    </p>
                  )}

                  {order.returnRequested && (
                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-3 mt-3">
                      <p className="text-xs font-medium text-orange-900 mb-1">Return Requested</p>
                      <p className="text-xs text-orange-800">{order.returnReason}</p>
                      {order.returnRequestedAt && (
                        <p className="text-[10px] text-orange-700 mt-1">
                          {new Date(order.returnRequestedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {trackingOrderId === order._id && (
                    <form onSubmit={handleTrackingSubmit} className="border border-border rounded-lg p-4 mt-3 grid gap-2 bg-white">
                      <p className="text-sm font-medium">Add Tracking</p>
                      {[
                        { label: "Carrier", key: "carrier" as const },
                        { label: "Tracking Number", key: "trackingNumber" as const },
                        { label: "Tracking URL", key: "url" as const },
                      ].map(({ label, key }) => (
                        <label key={key} className="grid gap-1">
                          <span className="text-xs text-muted">{label}</span>
                          <input
                            required
                            className="border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-ink"
                            value={tracking[key]}
                            onChange={(e) => setTracking((t) => ({ ...t, [key]: e.target.value }))}
                          />
                        </label>
                      ))}
                      <div className="flex gap-2 mt-1">
                        <button type="submit" className="bg-ink text-paper text-sm px-4 py-1.5 rounded">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setTrackingOrderId(null)}
                          className="text-sm px-4 py-1.5 border border-border rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered?.length === 0 && (
          <p className="text-sm text-muted px-4 py-8 text-center">No orders found.</p>
        )}
      </div>
    </div>
  );
}




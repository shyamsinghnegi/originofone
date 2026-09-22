"use client";

import { useMemo, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const DAY_MS = 24 * 60 * 60 * 1000;

const RANGE_PRESETS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "1Y", days: 365 },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f5a623",
  paid: "#2563eb",
  processing: "#7c3aed",
  shipped: "#0891b2",
  delivered: "#16a34a",
  cancelled: "#dc2626",
  refunded: "#db2777",
  failed: "#71717a",
};

export default function AdminDashboard() {
  const { isAuthenticated } = useConvexAuth();
  const [rangeDays, setRangeDays] = useState(30);
  const backfillPaidAt = useMutation(api.orders.backfillPaidAt);
  const [backfillStatus, setBackfillStatus] = useState<string | null>(null);

  const orders = useQuery(api.orders.listAll, isAuthenticated ? {} : "skip");
  const products = useQuery(api.products.listAdmin, isAuthenticated ? {} : "skip");

  const { startDate, endDate } = useMemo(() => {
    const end = Date.now();
    const start = end - rangeDays * DAY_MS;
    return { startDate: start, endDate: end };
  }, [rangeDays]);

  const data = useQuery(
    api.orders.analytics,
    isAuthenticated ? { startDate, endDate } : "skip"
  );

  async function handleBackfill() {
    setBackfillStatus("Syncing...");
    try {
      const result = await backfillPaidAt({});
      setBackfillStatus(
        result.updated > 0 ? `Synced ${result.updated} order(s).` : "Already up to date."
      );
    } catch {
      setBackfillStatus("Sync failed.");
    }
  }

  const snapshot = orders
    ? {
        total: orders.length,
        processing: orders.filter((o: any) => o.status === "processing").length,
        shipped: orders.filter((o: any) => o.status === "shipped").length,
        awaitingPayment: orders.filter((o: any) => o.status === "pending").length,
        activeProducts: products?.filter((p: any) => p.isActive).length ?? 0,
      }
    : null;

  return (
    <div>
      <h1 className="text-2xl font-[--font-editorial] mb-8">Dashboard</h1>

      {/* ── Snapshot: current-state counts, independent of date range ── */}
      {snapshot ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard label="Total Orders" value={snapshot.total} />
          <StatCard label="Processing" value={snapshot.processing} />
          <StatCard label="Shipped" value={snapshot.shipped} />
          <StatCard label="Awaiting Payment" value={snapshot.awaitingPayment} />
          <StatCard label="Active Products" value={snapshot.activeProducts} />
        </div>
      ) : (
        <p className="text-muted text-sm mb-10">Loading...</p>
      )}

      {/* ── Analytics: date-ranged revenue/sales insights ── */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-[--font-editorial]">Analytics</h2>
        <div className="flex gap-1 bg-border/40 rounded-full p-1">
          {RANGE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setRangeDays(p.days)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                rangeDays === p.days
                  ? "bg-black text-white"
                  : "text-muted hover:text-black"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={handleBackfill}
          className="text-xs text-muted underline hover:text-black transition-colors"
        >
          Sync historical orders
        </button>
        {backfillStatus && <p className="text-xs text-muted">{backfillStatus}</p>}
      </div>

      {!data ? (
        <p className="text-muted text-sm">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Net Revenue" value={`$${data.totalRevenue.toFixed(2)}`} accent="#2563eb" />
            <StatCard label="Refunds" value={`-$${data.refundedAmount.toFixed(2)}`} accent="#dc2626" />
            <StatCard label="Orders" value={data.orderCount} accent="#7c3aed" />
            <StatCard label="Avg. Order Value" value={`$${data.avgOrderValue.toFixed(2)}`} accent="#16a34a" />
          </div>
          {data.refundedAmount > 0 && (
            <p className="text-xs text-muted -mt-6 mb-8">
              Gross revenue was ${data.grossRevenue.toFixed(2)} before ${data.refundedAmount.toFixed(2)} in refunds.
            </p>
          )}

          <div className="border border-border rounded-lg p-4 mb-8">
            <p className="text-xs text-muted mb-4">Net revenue over time (refunds subtracted)</p>
            {data.trend.length === 0 ? (
              <p className="text-sm text-muted py-12 text-center">
                No paid orders in this range.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#737373" }} tickLine={false} axisLine={{ stroke: "#e5e5e5" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#737373" }} tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Net Revenue"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs text-muted mb-4">Orders by status</p>
              {data.statusBreakdown.length === 0 ? (
                <p className="text-sm text-muted py-12 text-center">
                  No orders in this range.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={data.statusBreakdown.map((s) => ({ ...s, label: STATUS_LABELS[s.status] ?? s.status }))}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {data.statusBreakdown.map((s) => (
                        <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? "#a3a3a3"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="border border-border rounded-lg p-4">
              <p className="text-xs text-muted mb-4">Top products</p>
              {data.products.length === 0 ? (
                <p className="text-sm text-muted py-12 text-center">
                  No sales in this range.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted border-b border-border">
                        <th className="pb-2 font-medium">Product</th>
                        <th className="pb-2 font-medium text-right">Units</th>
                        <th className="pb-2 font-medium text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.products.map((p) => (
                        <tr key={p.productId} className="border-b border-border last:border-0">
                          <td className="py-2.5 truncate max-w-40">{p.name}</td>
                          <td className="py-2.5 text-right">{p.units}</td>
                          <td className="py-2.5 text-right">${p.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="border border-border rounded-lg p-4 relative overflow-hidden">
      {accent && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

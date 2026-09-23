'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useConvexAuth } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { Id } from '@/../convex/_generated/dataModel'
import { Footer } from '@/components/ui'

const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'paid', label: 'Paid' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const

// Maps an order status to how far along the happy-path tracker it's reached.
// "placed" and "paid" collapse to the same step index since paid orders were
// obviously placed — pending sits before "paid" is reached at all.
const STEP_INDEX: Record<string, number> = {
  pending: 0,
  paid: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
}

const TERMINAL_LABELS: Record<string, string> = {
  cancelled: 'Order Cancelled',
  refunded: 'Order Refunded',
  failed: 'Payment Failed',
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const router = useRouter()
  const { isAuthenticated } = useConvexAuth()

  const order = useQuery(
    api.orders.getById,
    isAuthenticated ? { id: orderId as Id<'orders'> } : 'skip'
  )

  if (order === undefined) {
    return (
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-2xl text-neutral-400">Order not found.</p>
        <button onClick={() => router.push('/account')} className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5">
          Back to Account →
        </button>
      </div>
    )
  }

  const orderNumber = order._id.slice(-8).toUpperCase()
  const isTerminal = order.status in TERMINAL_LABELS
  const canCancelOnline = order.status === 'paid' || order.status === 'processing'
  const canRequestReturn = (order.status === 'shipped' || order.status === 'delivered') && !order.returnRequested
  const currentStepIndex = STEP_INDEX[order.status] ?? 0

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-5 py-14">
          <button
            onClick={() => router.push('/account')}
            className="text-[11px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors mb-6"
          >
            ← Back to Account
          </button>

          <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-1">Order #{orderNumber}</p>
          <h1 className="font-serif text-3xl text-black mb-2">
            {new Date(order._creationTime).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </h1>

          {/* Status tracker */}
          <div className="border border-neutral-200 p-6 my-8">
            {isTerminal ? (
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-[14px] text-black font-medium">{TERMINAL_LABELS[order.status]}</p>
              </div>
            ) : (
              <div className="flex items-start">
                {STEPS.map((s, i) => {
                  const reached = i <= currentStepIndex
                  const isLast = i === STEPS.length - 1
                  return (
                    <div key={s.key} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                          className={`w-3 h-3 rounded-full transition-colors ${reached ? 'bg-black' : 'bg-neutral-200'}`}
                        />
                        <p className={`text-[10px] tracking-widest uppercase text-center whitespace-nowrap ${reached ? 'text-black' : 'text-neutral-400'}`}>
                          {s.label}
                        </p>
                      </div>
                      {!isLast && (
                        <div className={`flex-1 h-px mx-1 -mt-5 transition-colors ${i < currentStepIndex ? 'bg-black' : 'bg-neutral-200'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {order.tracking && (
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-1">Tracking</p>
                <p className="text-[13px] text-black mb-1">
                  {order.tracking.carrier} · {order.tracking.trackingNumber}
                </p>
                <a
                  href={order.tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
                >
                  Track Package →
                </a>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border border-neutral-200 p-6 mb-8">
            <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-4">Items</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div>
                  <p className="text-[13px] text-black">{item.name}</p>
                  <p className="text-[11px] text-neutral-400">{item.color} / {item.size} × {item.quantity}</p>
                </div>
                <p className="text-[13px] text-black">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="pt-4 mt-2 space-y-1">
              <div className="flex justify-between text-[12px] text-neutral-500">
                <span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] text-neutral-500">
                <span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-[12px] text-neutral-500">
                <span>Tax</span><span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-black font-medium pt-1">
                <span>Total</span><span>${order.total.toFixed(2)} CAD</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="border border-neutral-200 p-6 mb-8">
            <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-2">Shipping Address</p>
            <p className="text-[13px] text-black">{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p className="text-[13px] text-black">{order.shippingAddress.line2}</p>}
            <p className="text-[13px] text-black">
              {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
            </p>
          </div>

          {order.returnRequested && (
            <p className="text-[12px] text-neutral-500 bg-neutral-50 px-4 py-3 mb-6">
              Return requested — we&apos;ll be in touch shortly.
            </p>
          )}

          {(canCancelOnline || canRequestReturn) && (
            <button
              onClick={() => router.push(`/account/orders/${order._id}/cancel`)}
              className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
            >
              {canCancelOnline ? 'Cancel Order' : 'Request Return'} →
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}


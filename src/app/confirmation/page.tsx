'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { Id } from '@/../convex/_generated/dataModel'
import { ProductCard, Footer } from '@/components/ui'

const SHIPPING_LABELS: Record<string, string> = {
  standard: 'Standard Shipping · 5–7 days',
  express: 'Express Shipping · 2–3 days',
  overnight: 'Overnight · Next day',
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') as Id<'orders'> | null

  const order = useQuery(
    api.orders.getById,
    orderId ? { id: orderId } : 'skip'
  )

  const createdDate = order
    ? new Date(order._creationTime).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  // Short human-readable order number derived from the Convex id.
  const orderNumber = order ? `OO-${order._id.slice(-8).toUpperCase()}` : ''

  return (
    <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
      {/* Success hero */}
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-20 border-b border-neutral-200 text-center">
        <div className="w-14 h-14 rounded-full border border-neutral-200 flex items-center justify-center mb-8 text-lg text-black">
          ✓
        </div>
        <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-4">Order Confirmed</p>
        <h1 className="font-serif leading-[1.05] mb-6 text-black" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
          Thank you,<br /><em>your order is placed.</em>
        </h1>
        <p className="text-[14px] text-neutral-500 max-w-md leading-relaxed">
          We've received your order and will send a confirmation to your email. Your items will be shipped within 2 business days.
        </p>
      </div>

      {/* Order details */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {order === undefined && orderId && (
          <p className="text-center text-neutral-400 text-[13px] py-8">Loading your order…</p>
        )}

        {(order === null || !orderId) && (
          <p className="text-center text-neutral-400 text-[13px] py-8">
            We couldn't find this order. Check <Link href="/account" className="underline text-black">your orders</Link>.
          </p>
        )}

        {order && (
          <>
            {/* Order card */}
            <div className="border border-neutral-200 mb-8">
              <div className="flex justify-between items-start px-6 py-5 border-b border-neutral-200">
                <div>
                  <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-1">Order number</p>
                  <p className="font-serif text-lg text-black">#{orderNumber}</p>
                  <p className="text-[12px] text-neutral-400 mt-0.5">{createdDate}</p>
                </div>
                <span className="text-[11px] tracking-widest uppercase px-3 py-1.5 bg-neutral-100 text-black">
                  {order.status === 'paid' ? 'Confirmed' : order.status}
                </span>
              </div>

              {/* Items */}
              <div className="px-6 py-5 border-b border-neutral-200 space-y-4">
                {order.items.map((item, idx) => (
                  <div key={`${item.productId}-${item.color}-${item.size}-${idx}`} className="flex gap-4 items-center">
                    <div className="w-16 h-20 shrink-0 bg-neutral-200 overflow-hidden flex items-end justify-center pb-1">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-8 h-14 rounded-t-full" style={{ background: 'rgba(0,0,0,0.18)' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] text-black">{item.name}</p>
                      <p className="text-[11px] text-neutral-400">{item.color} · {item.size}{item.quantity > 1 ? ` · ×${item.quantity}` : ''}</p>
                    </div>
                    <p className="text-[13px] text-black">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-5 space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-neutral-500">${order.subtotal.toFixed(2)} CAD</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-neutral-400">Shipping</span>
                  <span className={order.shippingCost === 0 ? 'text-black font-medium' : 'text-neutral-500'}>
                    {order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)} CAD`}
                  </span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-neutral-400">Taxes</span>
                  <span className="text-neutral-500">${order.tax.toFixed(2)} CAD</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                  <span className="text-[11px] tracking-widest uppercase text-black">Total Charged</span>
                  <span className="font-serif text-2xl text-black">${order.total.toFixed(2)} CAD</span>
                </div>
              </div>
            </div>

            {/* Shipping + Payment */}
            <div className="grid grid-cols-2 border border-neutral-200 divide-x divide-neutral-200 mb-8">
              <div className="px-5 py-5">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-3">Shipping To</p>
                <p className="text-[13px] text-neutral-500 leading-relaxed">
                  {order.shippingAddress.line1}{order.shippingAddress.line2 ? <>, {order.shippingAddress.line2}</> : null}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
              <div className="px-5 py-5">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-3">Payment</p>
                <p className="text-[13px] text-neutral-500 leading-relaxed">
                  Billed ${order.total.toFixed(2)} CAD<br /><br />
                  {SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <Link
                href="/collection/all"
                className="flex-1 bg-black text-white text-[11px] tracking-widest uppercase text-center py-4 hover:bg-neutral-900 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/account"
                className="flex-1 border border-black text-[11px] tracking-widest uppercase text-center py-4 hover:bg-black hover:text-white transition-colors"
              >
                View My Orders
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Recommendations */}
      <section className="px-6 md:px-10 py-16 border-t border-neutral-200">
        <div className="flex justify-between items-baseline mb-8">
          <h2 className="font-serif text-3xl text-black">You Might Also Like</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-1 gap-y-6 md:gap-x-2 md:gap-y-8">
          <ProductCard id="merino-knit-sweater"  name="Merino Knit Sweater"  price={168} />
          <ProductCard id="cashmere-scarf"        name="Cashmere Scarf"       price={88} />
          <ProductCard id="heritage-wool-coat"    name="Heritage Wool Coat"   price={398} />
        </div>
      </section>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <>
      <Suspense fallback={<div style={{ paddingTop: 'var(--nav-height, 60px)' }} />}>
        <ConfirmationContent />
      </Suspense>
      <Footer />
    </>
  )
}

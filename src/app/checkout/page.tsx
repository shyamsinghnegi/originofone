'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cartContext'
import { Footer } from '@/components/ui'

const STEPS = ['Cart', 'Shipping', 'Payment', 'Review']

export default function CheckoutPage() {
  const { items, total } = useCart()
  const [step] = useState(1)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard')

  const shippingCost = shippingMethod === 'standard' ? 0 : shippingMethod === 'express' ? 14.99 : 29.99
  const taxes = (total + shippingCost) * 0.13
  const orderTotal = total + shippingCost + taxes

  return (
    <>
      {/* Page offset — clears the fixed nav (60px) */}
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        {/* ── Top bar ── */}
        <div className="border-b border-neutral-200 px-6 md:px-10 py-4 flex items-center justify-between">
          {/* Step breadcrumb */}
          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span
                  className={`text-[10px] tracking-widest uppercase transition-colors ${
                    i === step ? 'text-black' : i < step ? 'text-neutral-400' : 'text-neutral-300'
                  }`}
                >
                  <span className="font-medium mr-1">{i + 1}</span>
                  {s}
                </span>
                {i < STEPS.length - 1 && <span className="text-neutral-200 text-xs">—</span>}
              </div>
            ))}
          </div>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 hidden md:flex items-center gap-1.5">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure Checkout
          </span>
        </div>

        {/* ── Main layout ── */}
        <div className="grid md:grid-cols-[1fr_380px] min-h-screen">
          {/* ── Left: form ── */}
          <div className="px-6 md:px-12 py-10 border-r border-neutral-200">

            {/* Contact */}
            <section className="mb-10">
              <h2 className="font-serif text-2xl mb-6 text-black">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                  />
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="accent-black w-3.5 h-3.5" />
                  <span className="text-[12px] text-neutral-500">Subscribe to our newsletter</span>
                </label>
              </div>
            </section>

            {/* Shipping address */}
            <section className="mb-10">
              <h2 className="font-serif text-2xl mb-6 text-black">Shipping Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">First Name</label>
                    <input type="text" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Last Name</label>
                    <input type="text" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Street Address</label>
                  <input type="text" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Apartment / Suite (Optional)</label>
                  <input type="text" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">City</label>
                    <input type="text" defaultValue="Toronto" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Province</label>
                    <input type="text" defaultValue="Ontario" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Postal Code</label>
                    <input type="text" defaultValue="M5V 2T6" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Country</label>
                    <input type="text" defaultValue="Canada" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping method */}
            <section className="mb-10">
              <h2 className="font-serif text-2xl mb-6 text-black">Shipping Method</h2>
              <div className="space-y-2">
                {[
                  { key: 'standard',  label: 'Standard Shipping', sub: '5–7 business days', price: 'Free' },
                  { key: 'express',   label: 'Express Shipping',  sub: '2–3 business days', price: '$14.99' },
                  { key: 'overnight', label: 'Overnight',         sub: 'Next business day',  price: '$29.99' },
                ].map(opt => (
                  <label
                    key={opt.key}
                    className={`flex items-center gap-4 border px-4 py-4 cursor-pointer transition-colors ${
                      shippingMethod === opt.key ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.key}
                      checked={shippingMethod === opt.key as typeof shippingMethod}
                      onChange={() => setShippingMethod(opt.key as typeof shippingMethod)}
                      className="accent-black"
                    />
                    <div className="flex-1">
                      <p className="text-[13px] text-black">{opt.label}</p>
                      <p className="text-[11px] text-neutral-400">{opt.sub}</p>
                    </div>
                    <span className={`text-[12px] ${opt.price === 'Free' ? 'text-black' : 'text-neutral-500'}`}>
                      {opt.price}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section className="mb-10">
              <h2 className="font-serif text-2xl mb-6 text-black">Payment</h2>
              <div className="flex gap-2 mb-5">
                {['VISA', 'AMEX', 'APPLE PAY'].map(p => (
                  <span key={p} className="border border-neutral-200 text-[10px] tracking-widest px-3 py-1.5 text-neutral-500">
                    {p}
                  </span>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Card Number</label>
                  <input type="text" placeholder="•••• •••• •••• ••••" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Expiry</label>
                    <input type="text" placeholder="MM / YY" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">CVV</label>
                    <input type="text" placeholder="•••" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300" />
                  </div>
                </div>
              </div>
            </section>

            <Link
              href="/confirmation"
              className="block w-full bg-black text-white text-[11px] tracking-widest uppercase text-center py-4 hover:bg-neutral-900 transition-colors"
            >
              Place Order →
            </Link>
          </div>

          {/* ── Right: order summary ── */}
          <div className="px-6 md:px-8 py-10 bg-neutral-50">
            <h2 className="font-serif text-2xl mb-6 text-black">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3 items-center">
                  <div className="w-16 h-20 bg-neutral-200 flex-shrink-0 flex items-end justify-center pb-1.5 relative">
                    <div className="w-7 h-12 bg-neutral-400 rounded-t-full" />
                    {item.qty > 1 && (
                      <span className="absolute -top-2 -right-2 bg-black text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center">
                        {item.qty}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-black">{item.name}</p>
                    <p className="text-[11px] text-neutral-400">{item.color} · {item.size}</p>
                  </div>
                  <p className="text-[13px] text-black">${item.price * item.qty}</p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex mb-6">
              <input
                type="text"
                placeholder="Gift card or discount code"
                className="flex-1 border border-neutral-200 px-3 py-2.5 text-[12px] bg-white outline-none focus:border-black transition-colors placeholder:text-neutral-300"
              />
              <button className="border border-l-0 border-neutral-200 px-4 text-[10px] tracking-widest uppercase text-neutral-500 hover:border-black hover:text-black transition-colors">
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-neutral-200 pt-4">
              <div className="flex justify-between text-[12px]">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-black">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-neutral-500">Shipping</span>
                <span className={shippingCost === 0 ? 'text-black' : 'text-neutral-500'}>
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-neutral-500">Taxes (13%)</span>
                <span className="text-neutral-500">${taxes.toFixed(2)}</span>
              </div>
              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="text-[11px] tracking-widest uppercase text-black">Total</span>
                <span className="font-serif text-2xl text-black">${orderTotal.toFixed(2)} CAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
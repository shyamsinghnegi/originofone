'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cartContext'
import { Footer } from '@/components/ui'

export default function CartPage() {
  const { items, removeItem, updateQty, total, count } = useCart()

  return (
    <>
      <div className="pt-[60px] min-h-screen">
        <div className="grid md:grid-cols-[1fr_380px] min-h-[80vh]">
          {/* Items */}
          <div className="px-6 md:px-10 py-12 border-r border-border">
            <div className="flex justify-between items-baseline mb-10 pb-6 border-b border-border">
              <h1 className="font-serif text-5xl md:text-6xl">Your Bag</h1>
              <span className="text-[12px] text-muted">{count} {count === 1 ? 'item' : 'items'}</span>
            </div>

            {items.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-serif text-2xl mb-6 text-muted">Your bag is empty.</p>
                <Link href="/collection" className="text-[11px] tracking-widest uppercase border-b border-ink pb-0.5 hover:text-muted hover:border-muted transition-colors">
                  Continue Shopping →
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="grid grid-cols-[96px_1fr_auto] gap-5 pb-8 border-b border-border items-start">
                    <Link href={`/product/${item.id}`} className="block">
                      <div className="w-24 h-28 bg-gray-100 flex items-end justify-center pb-2">
                        <div className="relative" style={{ width: 44, height: 80 }}>
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full w-5 h-5" style={{ background: 'rgba(0,0,0,0.15)' }} />
                          <div className="w-full h-full rounded-t-full" style={{ background: 'rgba(0,0,0,0.18)' }} />
                        </div>
                      </div>
                    </Link>
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-muted mb-1">Origin of One</p>
                      <Link href={`/product/${item.id}`}>
                        <p className="font-serif text-xl mb-1 hover:text-muted transition-colors">{item.name}</p>
                      </Link>
                      <p className="text-[12px] text-muted mb-4">{item.color} · {item.size}</p>
                      <div className="flex gap-0">
                        <button onClick={() => updateQty(item.id, item.size, item.qty - 1)} className="w-8 h-8 border border-border text-muted hover:border-ink hover:text-ink transition-colors flex items-center justify-center">−</button>
                        <div className="w-9 h-8 border-t border-b border-border flex items-center justify-center text-[12px]">{item.qty}</div>
                        <button onClick={() => updateQty(item.id, item.size, item.qty + 1)} className="w-8 h-8 border border-border text-muted hover:border-ink hover:text-ink transition-colors flex items-center justify-center">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-xl mb-2">${item.price * item.qty}</p>
                      <button onClick={() => removeItem(item.id, item.size)} className="text-[11px] text-muted underline hover:text-ink transition-colors">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Promo */}
            {items.length > 0 && (
              <div className="mt-8">
                <p className="text-[10px] tracking-widest uppercase text-muted mb-3">Promo Code</p>
                <div className="flex">
                  <input type="text" placeholder="Enter code" className="flex-1 border border-border px-4 py-2.5 text-[12px] bg-transparent outline-none focus:border-ink transition-colors placeholder:text-muted" />
                  <button className="border border-border border-l-0 px-5 text-[10px] tracking-widest uppercase text-muted hover:bg-ink hover:text-paper hover:border-ink transition-all duration-200">Apply</button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="px-6 md:px-8 py-12 bg-gray-50">
            <h2 className="font-serif text-2xl mb-8">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Subtotal</span>
                <span>${total.toFixed(2)} CAD</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Shipping</span>
                <span className={total >= 150 ? 'text-green-700' : ''}>{total >= 150 ? 'Free' : '$14.99'}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Taxes (est.)</span>
                <span>${(total * 0.13).toFixed(2)} CAD</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] tracking-widest uppercase">Total</span>
                <span className="font-serif text-2xl">${(total * 1.13).toFixed(2)} CAD</span>
              </div>
            </div>
            <Link href="/checkout" className="block w-full bg-ink text-paper text-[11px] tracking-widest uppercase text-center py-4 hover:bg-gray-900 transition-colors mb-3">
              Proceed to Checkout →
            </Link>
            <Link href="/collection" className="block w-full border border-border text-[11px] tracking-widest uppercase text-center py-3 text-muted hover:border-ink hover:text-ink transition-colors">
              Continue Shopping
            </Link>

            <div className="mt-6 space-y-2">
              {['🔒 Secure SSL checkout', '↩ Free 30-day returns', '📦 Ships in 2–3 business days'].map(t => (
                <p key={t} className="text-[11px] text-muted">{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cartContext'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, total, count } = useCart()

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart} />

      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <span className="text-[11px] tracking-widest uppercase">Your Bag ({count})</span>
          <button onClick={closeCart} className="text-muted hover:text-ink transition-colors" aria-label="Close">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-muted text-sm">Your bag is empty</p>
              <button onClick={closeCart} className="text-[11px] tracking-widest uppercase border-b border-ink pb-0.5 hover:text-muted transition-colors">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-100 shrink-0 flex items-end justify-center pb-2 overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-8 h-16 bg-gray-300 rounded-t-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-tight mb-1">{item.name}</p>
                    <p className="text-[11px] text-muted mb-2">{item.color} · {item.size}</p>
                    <div className="flex items-center gap-0">
                      <button
                        onClick={() => updateQty(item.productId, item.color, item.size, item.qty - 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm text-muted hover:border-ink hover:text-ink transition-colors"
                      >−</button>
                      <span className="w-8 h-7 border-t border-b border-border flex items-center justify-center text-[12px]">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.color, item.size, item.qty + 1)}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm text-muted hover:border-ink hover:text-ink transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px]">${(item.price * item.qty).toFixed(2)}</p>
                    <button
                      onClick={() => removeItem(item.productId, item.color, item.size)}
                      className="text-[10px] text-muted hover:text-ink transition-colors mt-1 underline"
                    >Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border space-y-3">
            <div className="flex justify-between text-[12px] text-muted">
              <span>Shipping</span>
              <span className="text-green-700">{total >= 150 ? 'Free' : '$14.99'}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[11px] tracking-widest uppercase">Total</span>
              <span className="font-serif text-xl">${total.toFixed(2)} CAD</span>
            </div>
            <Link href="/checkout" onClick={closeCart} className="block w-full bg-ink text-paper text-[11px] tracking-widest uppercase text-center py-4 hover:bg-gray-900 transition-colors">
              Checkout →
            </Link>
            <Link href="/cart" onClick={closeCart} className="block w-full border border-border text-[11px] tracking-widest uppercase text-center py-3 text-muted hover:border-ink hover:text-ink transition-colors">
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

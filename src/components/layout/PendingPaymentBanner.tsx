'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery, useConvexAuth } from 'convex/react'
import { api } from '@/../convex/_generated/api'

const VISIBLE_MS = 6000

export function PendingPaymentBanner() {
  const { isAuthenticated } = useConvexAuth()
  const pending = useQuery(api.orders.listMyPending, isAuthenticated ? undefined : 'skip')
  const router = useRouter()
  const pathname = usePathname()

  const [visible, setVisible] = useState(false)
  const [shownThisSession, setShownThisSession] = useState(false)

  const order = pending && pending.length > 0 ? pending[0] : null

  const suppressed =
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/confirmation') ||
    pathname?.startsWith('/account')

  useEffect(() => {
    if (suppressed || shownThisSession || !order) return
    setVisible(true)
    setShownThisSession(true)
    const t = setTimeout(() => setVisible(false), VISIBLE_MS)
    return () => clearTimeout(t)
  }, [suppressed, shownThisSession, order])

  if (!order) return null

  const extra = (pending?.length ?? 1) - 1

  return (
    <div
      className="fixed right-4 z-50 max-w-sm transition-all duration-500 ease-out"
      style={{
        bottom: '1.25rem',
        transform: visible ? 'translateY(0)' : 'translateY(150%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="bg-black text-white shadow-xl border border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-[11px] tracking-widest uppercase text-white/60">Payment incomplete</p>
          <button
            onClick={() => setVisible(false)}
            aria-label="Dismiss"
            className="text-white/50 hover:text-white transition-colors text-base leading-none -mt-0.5"
          >
            ×
          </button>
        </div>
        <p className="text-[13px] mb-3 leading-snug">
          Finish paying for order {order._id.slice(-8).toUpperCase()} — ${order.total.toFixed(2)} CAD
          {extra > 0 && <span className="text-white/60"> (+{extra} more)</span>}
        </p>
        <button
          onClick={() => router.push(`/checkout?resume=${order._id}`)}
          className="w-full text-[11px] tracking-widest uppercase border border-white/40 px-3 py-2 hover:bg-white hover:text-black transition-colors"
        >
          Complete Payment →
        </button>
      </div>
    </div>
  )
}

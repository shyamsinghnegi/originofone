'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useAction, useConvexAuth } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { Id } from '@/../convex/_generated/dataModel'
import { Footer } from '@/components/ui'

const REASONS = [
  'Changed my mind',
  'Wrong size / fit',
  'Item damaged / defective',
  'Item not as described',
  'Arrived too late',
  'Found a better price',
  'Other',
]

export default function CancelOrderPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params)
  const router = useRouter()
  const { isAuthenticated } = useConvexAuth()

  const order = useQuery(
    api.orders.getById,
    isAuthenticated ? { id: orderId as Id<'orders'> } : 'skip'
  )
  const refundOrder = useAction(api.actions.stripe.refundOrder)
  const requestReturn = useMutation(api.orders.requestReturn)

  const [reason, setReason] = useState<string | null>(null)
  const [otherText, setOtherText] = useState('')
  const [step, setStep] = useState<'reason' | 'confirm'>('reason')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'refunded' | 'returned' | null>(null)

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

  const mode: 'refund' | 'return' | null =
    order.status === 'paid' || order.status === 'processing'
      ? 'refund'
      : (order.status === 'shipped' || order.status === 'delivered') && !order.returnRequested
      ? 'return'
      : null

  const orderNumber = order._id.slice(-8).toUpperCase()
  const finalReason = reason === 'Other' ? otherText.trim() : reason

  async function handleConfirm() {
    if (!finalReason || !mode) return
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'refund') {
        await refundOrder({ orderId: order!._id, reason: finalReason })
        setDone('refunded')
      } else {
        await requestReturn({ id: order!._id, reason: finalReason })
        setDone('returned')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen bg-white">
        <div className="max-w-lg mx-auto px-5 py-14">
          <button
            onClick={() => router.push('/account')}
            className="text-[11px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors mb-6"
          >
            ← Back to Account
          </button>

          <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-1">Order #{orderNumber}</p>
          <h1 className="font-serif text-3xl text-black mb-8">
            {done ? 'Request Submitted' : 'Cancel or Return'}
          </h1>

          {done ? (
            <div className="border border-neutral-200 p-6">
              {done === 'refunded' ? (
                <>
                  <p className="text-[14px] text-black mb-2">Your order has been cancelled.</p>
                  <p className="text-[13px] text-neutral-500">
                    A full refund has been issued to your original payment method. You'll receive a confirmation email shortly.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[14px] text-black mb-2">Your return request has been submitted.</p>
                  <p className="text-[13px] text-neutral-500">
                    We'll review your request and follow up by email.
                  </p>
                </>
              )}
              <button
                onClick={() => router.push('/account')}
                className="mt-5 text-[11px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
              >
                Back to Account →
              </button>
            </div>
          ) : !mode ? (
            <div className="border border-neutral-200 p-6">
              <p className="text-[13px] text-neutral-500">
                {order.returnRequested
                  ? "A return has already been requested for this order."
                  : "This order is no longer eligible for online cancellation or return."}
              </p>
            </div>
          ) : (
            <>
              <div className="border border-neutral-200 p-5 mb-8">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-3">
                  {mode === 'refund' ? 'Cancel & Refund' : 'Request a Return'}
                </p>
                <p className="text-[13px] text-neutral-600 leading-relaxed">
                  {mode === 'refund'
                    ? "This order hasn't shipped yet, so cancelling will immediately refund the full amount to your original payment method."
                    : "This order has already shipped. Submitting a request will notify our team to review your return — no charge is made automatically."}
                </p>
                <div className="mt-4 pt-4 border-t border-neutral-100 text-[12px] text-neutral-500">
                  {order.items.map((item, i) => (
                    <p key={i} className="mb-0.5">
                      {item.name} <span className="text-neutral-400">({item.color}, {item.size}) × {item.quantity}</span>
                    </p>
                  ))}
                  <p className="mt-2 text-black">Total: ${order.total.toFixed(2)} CAD</p>
                </div>
              </div>

              {step === 'reason' && (
                <div>
                  <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-4">
                    Why are you {mode === 'refund' ? 'cancelling' : 'returning'} this order?
                  </p>
                  <div className="space-y-2 mb-5">
                    {REASONS.map(r => (
                      <label
                        key={r}
                        className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                          reason === r ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-black"
                        />
                        <span className="text-[13px] text-black">{r}</span>
                      </label>
                    ))}
                  </div>

                  {reason === 'Other' && (
                    <textarea
                      value={otherText}
                      onChange={e => setOtherText(e.target.value)}
                      rows={3}
                      placeholder="Tell us more..."
                      className="w-full border border-neutral-200 px-4 py-3 text-[13px] outline-none focus:border-black mb-5"
                    />
                  )}

                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!finalReason}
                    className="w-full bg-black text-white text-[11px] tracking-widest uppercase py-3.5 hover:bg-neutral-900 transition-colors disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 'confirm' && (
                <div>
                  <div className="border border-neutral-200 p-5 mb-5">
                    <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-2">Reason</p>
                    <p className="text-[13px] text-black">{finalReason}</p>
                  </div>

                  {error && <p className="text-[12px] text-red-600 mb-4">{error}</p>}

                  <p className="text-[12px] text-neutral-500 mb-5">
                    {mode === 'refund'
                      ? 'Confirming will immediately refund $' + order.total.toFixed(2) + ' CAD to your original payment method. This cannot be undone.'
                      : 'Confirming will submit your return request for review.'}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleConfirm}
                      disabled={submitting}
                      className="flex-1 bg-black text-white text-[11px] tracking-widest uppercase py-3.5 hover:bg-neutral-900 transition-colors disabled:opacity-40"
                    >
                      {submitting ? 'Submitting…' : mode === 'refund' ? 'Confirm Cancellation' : 'Submit Request'}
                    </button>
                    <button
                      onClick={() => setStep('reason')}
                      disabled={submitting}
                      className="px-6 border border-neutral-200 text-[11px] tracking-widest uppercase text-neutral-500 hover:border-black hover:text-black transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}


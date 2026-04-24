'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '@/lib/cartContext'
import { Footer } from '@/components/ui'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const STEP_LABELS = ['Cart', 'Shipping', 'Payment', 'Review']

interface ShippingData {
  email: string
  firstName: string
  lastName: string
  line1: string
  line2: string
  city: string
  province: string
  postalCode: string
  country: string
}

// ── Stripe inner component (needs Elements context) ──────────────────────────
function StripeSteps({
  step,
  onBack,
  onNextFromPayment,
  shipping,
  shippingMethod,
  shippingCost,
  taxes,
  subtotal,
  orderTotal,
}: {
  step: number
  onBack: () => void
  onNextFromPayment: () => void
  shipping: ShippingData
  shippingMethod: string
  shippingCost: number
  taxes: number
  subtotal: number
  orderTotal: number
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { items } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/confirmation` },
      redirect: 'if_required',
    })
    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed. Please try again.')
      setLoading(false)
    } else {
      router.push('/confirmation')
    }
  }

  // ── Step 2: Payment ──────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div>
        <h2 className="font-serif text-2xl mb-6 text-black">Payment</h2>
        <PaymentElement />
        {error && <p className="text-red-500 text-[12px] mt-3">{error}</p>}
        <div className="flex items-center gap-4 mt-6">
          <button onClick={onBack} className="text-[11px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors shrink-0">
            ← Back
          </button>
          <button
            onClick={onNextFromPayment}
            className="flex-1 bg-black text-white text-[11px] tracking-widest uppercase py-4 hover:bg-neutral-900 transition-colors"
          >
            Review Order →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 3: Review ───────────────────────────────────────────────────────
  return (
    <div>
      <h2 className="font-serif text-2xl mb-8 text-black">Review Order</h2>

      {/* Items */}
      <div className="border border-neutral-200 mb-5">
        <div className="px-5 py-3 border-b border-neutral-200 flex justify-between items-center">
          <p className="text-[10px] tracking-widest uppercase text-neutral-400">
            Items ({items.reduce((s, i) => s + i.qty, 0)})
          </p>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {items.map(item => (
            <div key={`${item.id}-${item.size}`} className="flex justify-between text-[13px]">
              <span className="text-neutral-500">{item.name} <span className="text-neutral-400">× {item.qty}</span></span>
              <span className="text-black">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ship to */}
      <div className="border border-neutral-200 mb-5">
        <div className="px-5 py-3 border-b border-neutral-200 flex justify-between items-center">
          <p className="text-[10px] tracking-widest uppercase text-neutral-400">Ship to</p>
        </div>
        <div className="px-5 py-4 text-[13px] text-neutral-500 leading-relaxed">
          {shipping.firstName} {shipping.lastName}<br />
          {shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ''}<br />
          {shipping.city}, {shipping.province} {shipping.postalCode}<br />
          {shipping.country}
        </div>
      </div>

      {/* Shipping method */}
      <div className="border border-neutral-200 mb-5">
        <div className="px-5 py-3 border-b border-neutral-200">
          <p className="text-[10px] tracking-widest uppercase text-neutral-400">Shipping</p>
        </div>
        <div className="px-5 py-4 text-[13px] text-neutral-500">
          {shippingMethod === 'standard' ? 'Standard (5–7 days) — Free'
            : shippingMethod === 'express' ? `Express (2–3 days) — $14.99`
            : `Overnight (next day) — $29.99`}
        </div>
      </div>

      {/* Total breakdown */}
      <div className="border border-neutral-200 mb-8">
        <div className="px-5 py-3 border-b border-neutral-200">
          <p className="text-[10px] tracking-widest uppercase text-neutral-400">Order Total</p>
        </div>
        <div className="px-5 py-4 space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-neutral-500">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-neutral-500">Shipping</span>
            <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-neutral-500">Tax (13% HST)</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline border-t border-neutral-200 pt-3 mt-1">
            <span className="text-[11px] tracking-widest uppercase text-black">Total</span>
            <span className="font-serif text-xl text-black">${orderTotal.toFixed(2)} CAD</span>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-[12px] mb-4">{error}</p>}

      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-[11px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors shrink-0">
          ← Back
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={!stripe || loading}
          className="flex-1 bg-black text-white text-[11px] tracking-widest uppercase py-4 hover:bg-neutral-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order →'}
        </button>
      </div>
      <p className="text-[11px] text-neutral-400 text-center mt-4">
        By placing your order you agree to our Terms &amp; Privacy Policy.
      </p>
    </div>
  )
}

// ── Main checkout page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, total, updateQty, removeItem } = useCart()
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)

  const [shipping, setShipping] = useState<ShippingData>({
    email: '', firstName: '', lastName: '',
    line1: '', line2: '',
    city: 'Toronto', province: 'Ontario', postalCode: 'M5V 2T6', country: 'Canada',
  })
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard')

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [intentLoading, setIntentLoading] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)

  const shippingCost = shippingMethod === 'standard' ? 0 : shippingMethod === 'express' ? 14.99 : 29.99
  const taxes = (total + shippingCost) * 0.13
  const orderTotal = total + shippingCost + taxes

  const goToStep = async (target: number) => {
    // Going back past step 2 clears the PaymentIntent so amount stays accurate
    if (target < 2 && clientSecret) setClientSecret(null)

    // Entering step 2 for the first time (or after clearing): create PaymentIntent
    if (target === 2 && !clientSecret) {
      setIntentLoading(true)
      setIntentError(null)
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountInCents: Math.round(orderTotal * 100) }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to initialize payment')
        setClientSecret(data.clientSecret)
      } catch (err: unknown) {
        setIntentError(err instanceof Error ? err.message : 'Failed to initialize payment')
        setIntentLoading(false)
        return
      }
      setIntentLoading(false)
    }

    setStep(target)
    setMaxStep(m => Math.max(m, target))
  }

  // Right-side summary (always visible)
  const OrderSummary = () => (
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
            <p className="text-[13px] text-black">${(item.price * item.qty).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-neutral-200 pt-4">
        <div className="flex justify-between text-[12px]">
          <span className="text-neutral-500">Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-neutral-500">Shipping</span>
          <span className={shippingCost === 0 ? 'text-black' : 'text-neutral-500'}>
            {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-[12px]">
          <span className="text-neutral-500">Taxes (13%)</span>
          <span>${taxes.toFixed(2)}</span>
        </div>
        <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
          <span className="text-[11px] tracking-widest uppercase text-black">Total</span>
          <span className="font-serif text-2xl text-black">${orderTotal.toFixed(2)} CAD</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        {/* ── Step indicator ── */}
        <div className="border-b border-neutral-200 px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => i <= maxStep ? goToStep(i) : undefined}
                  disabled={i > maxStep}
                  className={`text-[10px] tracking-widest uppercase transition-colors ${
                    i === step
                      ? 'text-black'
                      : i < step
                      ? 'text-neutral-400 hover:text-black'
                      : 'text-neutral-300 cursor-default'
                  }`}
                >
                  <span className="font-medium mr-1">{i + 1}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <span className="text-neutral-200 text-xs">—</span>
                )}
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

        <div className="grid md:grid-cols-[1fr_380px] min-h-[calc(100vh-var(--nav-height,60px))]">
          {/* ── Left: active step ── */}
          <div className="px-6 md:px-12 py-10 border-r border-neutral-200">

            {/* ── Step 0: Cart ── */}
            {step === 0 && (
              <div>
                <h2 className="font-serif text-2xl mb-6 text-black">Your Cart</h2>
                {items.length === 0 ? (
                  <p className="text-neutral-400 text-[13px] mb-6">Your cart is empty.</p>
                ) : (
                  <div className="space-y-6 mb-8">
                    {items.map(item => (
                      <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                        <div className="w-16 h-20 bg-neutral-200 flex-shrink-0 flex items-end justify-center pb-1">
                          <div className="w-7 h-12 bg-neutral-400 rounded-t-full" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] text-black mb-0.5">{item.name}</p>
                          <p className="text-[11px] text-neutral-400 mb-2.5">{item.color} · {item.size}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-neutral-200">
                              <button
                                onClick={() => updateQty(item.id, item.size, item.qty - 1)}
                                className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-black transition-colors"
                              >−</button>
                              <span className="w-8 h-7 border-x border-neutral-200 flex items-center justify-center text-[12px]">{item.qty}</span>
                              <button
                                onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                                className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-black transition-colors"
                              >+</button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id, item.size)}
                              className="text-[11px] text-neutral-400 hover:text-black transition-colors underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <p className="text-[13px] text-black shrink-0">${(item.price * item.qty).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => goToStep(1)}
                  disabled={items.length === 0}
                  className="block w-full bg-black text-white text-[11px] tracking-widest uppercase text-center py-4 hover:bg-neutral-900 transition-colors disabled:opacity-40"
                >
                  Continue to Shipping →
                </button>
              </div>
            )}

            {/* ── Step 1: Shipping ── */}
            {step === 1 && (
              <div>
                {/* Contact */}
                <section className="mb-10">
                  <h2 className="font-serif text-2xl mb-6 text-black">Contact</h2>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={e => setShipping(s => ({ ...s, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                    />
                  </div>
                </section>

                {/* Address */}
                <section className="mb-10">
                  <h2 className="font-serif text-2xl mb-6 text-black">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">First Name</label>
                        <input type="text" value={shipping.firstName} onChange={e => setShipping(s => ({ ...s, firstName: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Last Name</label>
                        <input type="text" value={shipping.lastName} onChange={e => setShipping(s => ({ ...s, lastName: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Street Address</label>
                      <input type="text" value={shipping.line1} onChange={e => setShipping(s => ({ ...s, line1: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Apartment / Suite (Optional)</label>
                      <input type="text" value={shipping.line2} onChange={e => setShipping(s => ({ ...s, line2: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">City</label>
                        <input type="text" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Province</label>
                        <input type="text" value={shipping.province} onChange={e => setShipping(s => ({ ...s, province: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Postal Code</label>
                        <input type="text" value={shipping.postalCode} onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-500 mb-1.5">Country</label>
                        <input type="text" value={shipping.country} onChange={e => setShipping(s => ({ ...s, country: e.target.value }))} className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
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

                {intentError && <p className="text-red-500 text-[12px] mb-4">{intentError}</p>}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => goToStep(0)}
                    className="text-[11px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors shrink-0"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => goToStep(2)}
                    disabled={intentLoading}
                    className="flex-1 bg-black text-white text-[11px] tracking-widest uppercase py-4 hover:bg-neutral-900 transition-colors disabled:opacity-50"
                  >
                    {intentLoading ? 'Preparing payment...' : 'Continue to Payment →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Steps 2 & 3: Stripe (keep Elements mounted across both) ── */}
            {(step === 2 || step === 3) && clientSecret && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: { fontFamily: '"DM Sans", sans-serif', borderRadius: '0px' },
                  },
                }}
              >
                <StripeSteps
                  step={step}
                  onBack={() => step === 2 ? goToStep(1) : goToStep(2)}
                  onNextFromPayment={() => goToStep(3)}
                  shipping={shipping}
                  shippingMethod={shippingMethod}
                  shippingCost={shippingCost}
                  taxes={taxes}
                  subtotal={total}
                  orderTotal={orderTotal}
                />
              </Elements>
            )}
          </div>

          {/* ── Right: persistent order summary ── */}
          <OrderSummary />
        </div>
      </div>
      <Footer />
    </>
  )
}

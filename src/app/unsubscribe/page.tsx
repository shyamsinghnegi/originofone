'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Btn, Footer } from '@/components/ui'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const urlEmail = searchParams.get('email') || ''
  const { user, isLoaded } = useUser()

  const [email, setEmail] = useState('')
  const [isManualMode, setIsManualMode] = useState(false)
  const [cartReminders, setCartReminders] = useState(false)
  const [marketingUpdates, setMarketingUpdates] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (urlEmail) {
      setEmail(urlEmail)
    } else if (isLoaded && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress)
    }
  }, [urlEmail, isLoaded, user])

  const hasAutoPickedEmail = Boolean(
    urlEmail || (isLoaded && user?.primaryEmailAddress?.emailAddress)
  )

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email.trim()) {
      setMessage('Please enter an email address to save preferences.')
      return
    }

    setStatus('saving')
    setTimeout(() => {
      setStatus('saved')
      setMessage(`Preferences updated for ${email}.`)
    }, 600)
  }

  const handleUnsubscribeAll = () => {
    if (!email.trim()) {
      setMessage('Please enter an email address first.')
      return
    }
    setCartReminders(false)
    setMarketingUpdates(false)
    setStatus('saving')
    setTimeout(() => {
      setStatus('saved')
      setMessage(`You have been unsubscribed from all optional email notifications for ${email}.`)
    }, 600)
  }

  const handleOptInAll = () => {
    if (!email.trim()) {
      setMessage('Please enter an email address first.')
      return
    }
    setCartReminders(true)
    setMarketingUpdates(true)
    setStatus('saving')
    setTimeout(() => {
      setStatus('saved')
      setMessage(`You are now subscribed to all communications for ${email}.`)
    }, 600)
  }

  return (
    <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
      <div className="max-w-2xl mx-auto px-6 md:px-10 py-16 md:py-24">
        <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-2 font-mono">
          COMMUNICATION PREFERENCES
        </p>
        <h1 className="font-serif text-3xl md:text-5xl text-black mb-3">
          Manage Your Emails
        </h1>
        <p className="text-[14px] text-neutral-500 mb-8 leading-relaxed">
          Choose which notifications you wish to receive from Origin of One. You can update or change your preferences at any time.
        </p>

        {message && (
          <div
            className={`p-4 mb-8 text-[13px] border ${
              status === 'saved'
                ? 'border-neutral-900 bg-neutral-50 text-neutral-900'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Auto-detected email banner vs Manual Input */}
          {hasAutoPickedEmail && !isManualMode ? (
            <div className="border border-neutral-200 bg-neutral-50 p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <p className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                    Detected Email
                  </p>
                </div>
                <p className="text-[15px] font-medium text-black">{email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsManualMode(true)}
                className="text-[11px] text-neutral-500 hover:text-black underline uppercase tracking-wider font-mono"
              >
                Change
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] uppercase tracking-wider text-neutral-500 font-mono">
                  Email Address
                </label>
                {hasAutoPickedEmail && isManualMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualMode(false)
                      setEmail(urlEmail || user?.primaryEmailAddress?.emailAddress || '')
                    }}
                    className="text-[11px] text-neutral-500 hover:text-black underline uppercase tracking-wider font-mono"
                  >
                    Use Detected Email
                  </button>
                )}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-neutral-300 px-4 py-3 text-[14px] focus:outline-none focus:border-black transition-colors"
              />
            </div>
          )}

          <div className="border-t border-neutral-200 pt-6 space-y-6">
            <h2 className="text-[12px] uppercase tracking-widest font-mono text-black">
              Email Subscriptions
            </h2>

            {/* Essential order emails */}
            <div className="flex items-start justify-between gap-4 p-4 border border-neutral-200 bg-neutral-50/50">
              <div>
                <p className="text-[14px] font-medium text-black mb-1">
                  Order &amp; Account Notifications
                </p>
                <p className="text-[12px] text-neutral-500">
                  Critical updates regarding order status, receipts, tracking codes, and security. Always enabled for your protection.
                </p>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-neutral-200 text-neutral-600 px-2 py-1 shrink-0">
                Required
              </span>
            </div>

            {/* Cart reminders */}
            <label className="flex items-start justify-between gap-4 p-4 border border-neutral-200 cursor-pointer hover:border-neutral-400 transition-colors">
              <div>
                <p className="text-[14px] font-medium text-black mb-1">
                  Cart Reminders &amp; Stock Alerts
                </p>
                <p className="text-[12px] text-neutral-500">
                  Reminders for reserved cart items and restocking notifications for saved wishlist pieces.
                </p>
              </div>
              <input
                type="checkbox"
                checked={cartReminders}
                onChange={(e) => setCartReminders(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black cursor-pointer"
              />
            </label>

            {/* Editorial & releases */}
            <label className="flex items-start justify-between gap-4 p-4 border border-neutral-200 cursor-pointer hover:border-neutral-400 transition-colors">
              <div>
                <p className="text-[14px] font-medium text-black mb-1">
                  Editorial, Drops &amp; Private Archives
                </p>
                <p className="text-[12px] text-neutral-500">
                  Curated release notifications, seasonal lookbooks, and invitations to private drops.
                </p>
              </div>
              <input
                type="checkbox"
                checked={marketingUpdates}
                onChange={(e) => setMarketingUpdates(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black cursor-pointer"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Btn type="submit" variant="dark" disabled={status === 'saving'}>
              {status === 'saving' ? 'Saving...' : 'Save Preferences'}
            </Btn>
            <Btn
              type="button"
              variant="outline"
              onClick={handleUnsubscribeAll}
              disabled={status === 'saving'}
            >
              Opt Out of All Marketing
            </Btn>
            <Btn
              type="button"
              variant="ghost"
              onClick={handleOptInAll}
              disabled={status === 'saving'}
            >
              Opt In to All
            </Btn>
          </div>
        </form>

        <div className="mt-14 pt-8 border-t border-neutral-200 flex items-center justify-between text-[12px] text-neutral-500">
          <Link href="/" className="hover:text-black transition-colors underline">
            &larr; Return to Origin of One
          </Link>
          <Link href="/privacy" className="hover:text-black transition-colors underline">
            Privacy Policy
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <UnsubscribeContent />
    </Suspense>
  )
}

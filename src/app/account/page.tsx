'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/ui'

const ORDERS = [
  {
    id: '#OO-2025-8847',
    date: 'December 14, 2025',
    status: 'Shipped',
    statusStyle: 'text-neutral-700 bg-neutral-100',
    items: ['Tundra Wool Overcoat', 'Wool Beanie'],
    total: '$458.78 CAD',
    bgs: ['#e5e5e5', '#d4d4d4'],
  },
  {
    id: '#OO-2025-6201',
    date: 'October 3, 2025',
    status: 'Delivered',
    statusStyle: 'text-black bg-neutral-100',
    items: ['Merino Knit Sweater'],
    total: '$168.00 CAD',
    bgs: ['#ebebeb'],
  },
]

type Tab = 'orders' | 'wishlist' | 'addresses' | 'details'

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [dashTab, setDashTab] = useState<Tab>('orders')

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!isLoaded) {
    return (
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : user?.primaryEmailAddress?.emailAddress?.split('@')[0] ?? 'there'

  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen">
        <div className="grid md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="border-r border-neutral-200 px-6 py-10">
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-6">My Account</p>
            <div className="space-y-0.5">
              {([
                ['orders',    'Orders'],
                ['wishlist',  'Wishlist'],
                ['addresses', 'Addresses'],
                ['details',   'Details'],
              ] as [Tab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setDashTab(key)}
                  className={`block w-full text-left py-2.5 text-[12px] tracking-wide transition-colors border-l-2 pl-3 ${
                    dashTab === key
                      ? 'border-black text-black'
                      : 'border-transparent text-neutral-500 hover:text-black'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="pt-6 border-t border-neutral-200 mt-6">
              <button
                onClick={handleSignOut}
                className="block text-[12px] text-neutral-400 hover:text-black transition-colors py-2 w-full text-left"
              >
                Sign Out
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="px-6 md:px-10 py-10">
            <div className="mb-8">
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-1">Welcome back</p>
              <h1 className="font-serif text-4xl md:text-5xl text-black">{displayName}</h1>
            </div>

            {dashTab === 'orders' && (
              <div className="space-y-4">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-6">Order History</p>
                {ORDERS.map(order => (
                  <div key={order.id} className="border border-neutral-200">
                    <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-200">
                      <div>
                        <p className="text-[13px] text-black mb-0.5">{order.id}</p>
                        <p className="text-[11px] text-neutral-400">{order.date}</p>
                      </div>
                      <span className={`text-[10px] tracking-widest uppercase px-3 py-1 ${order.statusStyle}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="px-5 py-4 flex gap-3">
                      {order.bgs.map((bg, i) => (
                        <div key={i} className="w-12 h-14 flex items-end justify-center pb-1 flex-shrink-0" style={{ background: bg }}>
                          <div className="w-6 h-9 rounded-t-full" style={{ background: 'rgba(0,0,0,0.2)' }} />
                        </div>
                      ))}
                      <div className="flex-1 pl-2">
                        {order.items.map(item => (
                          <p key={item} className="text-[13px] text-black mb-0.5">{item}</p>
                        ))}
                        <p className="text-[12px] text-neutral-400 mt-1">{order.total}</p>
                      </div>
                      <div className="flex flex-col gap-2 text-right">
                        <Link href="/confirmation" className="text-[11px] text-neutral-400 underline hover:text-black transition-colors">View Order</Link>
                        <button className="text-[11px] text-neutral-400 underline hover:text-black transition-colors">Track</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {dashTab === 'wishlist' && (
              <div className="py-16 text-center border border-dashed border-neutral-200">
                <p className="font-serif text-2xl text-neutral-400 mb-4">Your wishlist is empty.</p>
                <Link href="/collection" className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors">
                  Browse Collection →
                </Link>
              </div>
            )}

            {dashTab === 'addresses' && (
              <div className="space-y-4">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-6">Saved Addresses</p>
                <div className="border border-dashed border-neutral-200 w-full py-10 flex flex-col items-center gap-3">
                  <p className="text-[13px] text-neutral-400">No addresses saved yet.</p>
                  <button className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors">
                    + Add Address
                  </button>
                </div>
              </div>
            )}

            {dashTab === 'details' && (
              <div className="max-w-md space-y-5">
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-6">Account Details</p>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Name</label>
                  <div className="border border-neutral-200 px-4 py-3 text-[13px] text-black bg-neutral-50">
                    {user?.fullName ?? '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Email</label>
                  <div className="border border-neutral-200 px-4 py-3 text-[13px] text-black bg-neutral-50">
                    {email}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Member Since</label>
                  <div className="border border-neutral-200 px-4 py-3 text-[13px] text-neutral-500 bg-neutral-50">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                  </div>
                </div>
                <p className="text-[11px] text-neutral-400">
                  To update your name or email, visit{' '}
                  <a href="https://accounts.clerk.dev/user" target="_blank" rel="noreferrer" className="underline hover:text-black transition-colors">
                    account settings
                  </a>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

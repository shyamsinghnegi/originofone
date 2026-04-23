'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [dashTab, setDashTab] = useState<Tab>('orders')
  const [loggedIn] = useState(true)

  return (
    <>
      {/* Page offset — clears fixed nav */}
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen">
        {loggedIn ? (
          /* ── DASHBOARD ── */
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
                <Link href="/" className="block text-[12px] text-neutral-400 hover:text-black transition-colors py-2">
                  Sign Out
                </Link>
              </div>
            </aside>

            {/* Main */}
            <div className="px-6 md:px-10 py-10">
              <div className="mb-8">
                <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-1">Welcome back</p>
                <h1 className="font-serif text-4xl md:text-5xl text-black">Jane Smith</h1>
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
                          <Link href="/confirmation" className="text-[11px] text-neutral-400 underline hover:text-black transition-colors">
                            View Order
                          </Link>
                          <button className="text-[11px] text-neutral-400 underline hover:text-black transition-colors">
                            Track
                          </button>
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
                  <div className="border border-neutral-200 p-5 relative">
                    <span className="absolute top-4 right-4 text-[10px] tracking-widest uppercase bg-neutral-100 text-neutral-500 px-2 py-1">
                      Default
                    </span>
                    <p className="text-[13px] leading-relaxed text-neutral-500">
                      Jane Smith<br />
                      123 Main Street<br />
                      Toronto, ON M5V 2T6<br />
                      Canada
                    </p>
                    <button className="mt-3 text-[11px] text-neutral-400 underline hover:text-black transition-colors">Edit</button>
                  </div>
                  <button className="border border-dashed border-neutral-200 w-full py-5 text-[11px] tracking-widest uppercase text-neutral-400 hover:border-black hover:text-black transition-colors">
                    + Add New Address
                  </button>
                </div>
              )}

              {dashTab === 'details' && (
                <div className="max-w-md space-y-5">
                  <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-6">Account Details</p>
                  {[
                    { label: 'First Name', value: 'Jane' },
                    { label: 'Last Name',  value: 'Smith' },
                    { label: 'Email',      value: 'jane@example.com' },
                    { label: 'Password',   value: '••••••••' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">{f.label}</label>
                      <div className="flex items-center border border-neutral-200">
                        <input
                          type={f.label === 'Password' ? 'password' : 'text'}
                          defaultValue={f.value}
                          className="flex-1 px-4 py-3 text-[13px] bg-transparent outline-none text-black"
                        />
                        <button className="px-4 text-[10px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors border-l border-neutral-200 py-3">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="bg-black text-white text-[11px] tracking-widest uppercase px-8 py-3 hover:bg-neutral-900 transition-colors mt-2">
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── LOGIN / REGISTER ── */
          <div className="grid md:grid-cols-2 min-h-[calc(100vh-60px)]">
            {/* Form side */}
            <div className="px-8 md:px-16 py-16 flex flex-col justify-center border-r border-neutral-200">
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-3">My Account</p>
              <h1 className="font-serif text-5xl mb-8 text-black">
                {authTab === 'login' ? 'Welcome back.' : 'Create account.'}
              </h1>

              <div className="flex border-b border-neutral-200 mb-8">
                {(['login', 'register'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setAuthTab(t)}
                    className={`mr-6 pb-3 text-[11px] tracking-widest uppercase transition-colors border-b-2 ${
                      authTab === t ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
                    }`}
                  >
                    {t === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              <div className="space-y-4 max-w-sm">
                {authTab === 'register' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">First Name</label>
                      <input type="text" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Last Name</label>
                      <input type="text" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Email Address</label>
                  <input type="email" placeholder="you@example.com" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300" />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Password</label>
                  <input type="password" placeholder="••••••••" className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300" />
                </div>

                <button className="w-full bg-black text-white py-3.5 text-[11px] tracking-widest uppercase hover:bg-neutral-900 transition-colors">
                  {authTab === 'login' ? 'Sign In →' : 'Create Account →'}
                </button>

                {authTab === 'login' && (
                  <>
                    <button className="text-[11px] text-neutral-400 underline hover:text-black transition-colors w-full text-center">
                      Forgot password?
                    </button>
                    <div className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-neutral-200" />
                      <span className="text-[10px] tracking-widest uppercase text-neutral-400">or</span>
                      <div className="flex-1 h-px bg-neutral-200" />
                    </div>
                    <button className="w-full border border-neutral-200 py-3.5 text-[11px] tracking-widest uppercase text-neutral-400 hover:border-black hover:text-black transition-colors">
                      Continue as Guest
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Brand side */}
            <div className="hidden md:flex bg-black items-end justify-center pb-16 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 80px, rgba(255,255,255,1) 80px, rgba(255,255,255,1) 81px)' }}
              />
              <div className="relative z-10 text-center px-10">
                <div className="relative mb-8 inline-block" style={{ width: 120, height: 280 }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full w-14 h-14" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="w-full h-full rounded-t-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="absolute rounded" style={{ top: '13%', left: '-40%', right: '-40%', height: '32%', background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <p className="font-serif text-white/50 text-xl italic">Members enjoy<br />early access to drops.</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
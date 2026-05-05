'use client'

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useConvexAuth } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { Footer } from '@/components/ui'

type View = 'dashboard' | 'profile' | 'orders' | 'security' | 'addresses'

const STATUS_STYLES: Record<string, string> = {
  pending:    'text-neutral-500 bg-neutral-100',
  paid:       'text-neutral-600 bg-neutral-100',
  processing: 'text-neutral-700 bg-neutral-100',
  shipped:    'text-black bg-neutral-100',
  delivered:  'text-black bg-neutral-200',
  cancelled:  'text-red-600 bg-red-50',
  refunded:   'text-neutral-500 bg-neutral-100',
}

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const { isAuthenticated } = useConvexAuth()

  const convexUser = useQuery(api.users.me, isAuthenticated ? undefined : 'skip')
  const orders = useQuery(api.orders.listMine, isAuthenticated ? undefined : 'skip')
  const updateDetails = useMutation(api.users.updateDetails)
  const addAddress = useMutation(api.users.addAddress)
  const removeAddress = useMutation(api.users.removeAddress)

  const [view, setView] = useState<View>('dashboard')

  // Profile form
  const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Password form
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSaved, setPwSaved] = useState(false)

  // Address form
  const [showAddForm, setShowAddForm] = useState(false)
  const [addr, setAddr] = useState({ line1: '', line2: '', city: '', province: '', postalCode: '', country: 'Canada', phone: '', isDefault: false })
  const [addrSaving, setAddrSaving] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setProfileSaving(true)
    try {
      const clerkPatch: { firstName?: string; lastName?: string } = {}
      if (profile.firstName.trim()) clerkPatch.firstName = profile.firstName.trim()
      if (profile.lastName.trim()) clerkPatch.lastName = profile.lastName.trim()
      if (Object.keys(clerkPatch).length) await user.update(clerkPatch)
      if (profile.phone.trim()) await updateDetails({ phone: profile.phone.trim() })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError(null)
    if (pw.next !== pw.confirm) { setPwError('Passwords do not match.'); return }
    if (pw.next.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    setPwSaving(true)
    try {
      await user?.updatePassword({ currentPassword: pw.current, newPassword: pw.next })
      setPwSaved(true)
      setPw({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwSaved(false), 3000)
    } catch (err: any) {
      setPwError(err?.errors?.[0]?.message ?? 'Something went wrong.')
    } finally {
      setPwSaving(false)
    }
  }

  const handleAddAddress = async () => {
    if (!addr.line1 || !addr.city || !addr.province || !addr.postalCode) return
    setAddrSaving(true)
    try {
      await addAddress({
        address: {
          id: Date.now().toString(),
          line1: addr.line1,
          line2: addr.line2 || undefined,
          city: addr.city,
          province: addr.province,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone || undefined,
          isDefault: addr.isDefault,
        },
      })
      setAddr({ line1: '', line2: '', city: '', province: '', postalCode: '', country: 'Canada', phone: '', isDefault: false })
      setShowAddForm(false)
    } finally {
      setAddrSaving(false)
    }
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
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-5 py-12">

          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-1">
                {view === 'dashboard' ? 'My Account' : (
                  <button onClick={() => setView('dashboard')} className="hover:text-black transition-colors">
                    ← My Account
                  </button>
                )}
              </p>
              <h1 className="font-serif text-4xl text-black font-extrabold">
                {view === 'dashboard' && displayName}
                {view === 'profile' && 'My Profile'}
                {view === 'orders' && 'Your Orders'}
                {view === 'security' && 'Login & Security'}
                {view === 'addresses' && 'Your Addresses'}
              </h1>
            </div>
            {view === 'dashboard' && (
              <button
                onClick={handleSignOut}
                className="text-[10px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Dashboard cards */}
          {view === 'dashboard' && (
            <div className="grid grid-cols-2 gap-4">
              <DashCard
                title="My Profile"
                subtitle={email}
                icon={<PersonIcon />}
                onClick={() => { setProfile({ firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', phone: convexUser?.phone ?? '' }); setView('profile') }}
              />
              <DashCard
                title="Your Orders"
                subtitle={orders === undefined ? 'Loading…' : orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
                icon={<BoxIcon />}
                onClick={() => setView('orders')}
              />
              <DashCard
                title="Login & Security"
                subtitle="Password & sign-in"
                icon={<LockIcon />}
                onClick={() => { setPw({ current: '', next: '', confirm: '' }); setPwError(null); setPwSaved(false); setView('security') }}
              />
              <DashCard
                title="Your Addresses"
                subtitle={convexUser?.addresses?.length ? `${convexUser.addresses.length} saved` : 'No addresses yet'}
                icon={<PinIcon />}
                onClick={() => { setShowAddForm(false); setView('addresses') }}
              />
            </div>
          )}

          {/* Profile sub-view */}
          {view === 'profile' && (
            <div className="max-w-sm space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                    placeholder={user?.firstName ?? 'First name'}
                    className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                    placeholder={user?.lastName ?? 'Last name'}
                    className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Email Address</label>
                <div className="border border-neutral-100 px-4 py-3 text-[13px] text-neutral-400 bg-neutral-50">{email}</div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  placeholder={convexUser?.phone ?? '+1 (416) 000-0000'}
                  className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                className="w-full bg-black text-white text-[10px] tracking-widest uppercase py-3.5 hover:bg-neutral-900 transition-colors disabled:opacity-50"
              >
                {profileSaved ? 'Saved ✓' : profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Orders sub-view */}
          {view === 'orders' && (
            <div className="space-y-3">
              {orders === undefined && (
                <div className="flex justify-center py-16">
                  <div className="w-4 h-4 border border-neutral-300 border-t-black rounded-full animate-spin" />
                </div>
              )}
              {orders?.length === 0 && (
                <div className="py-16 text-center border border-dashed border-neutral-200">
                  <p className="font-serif text-2xl text-neutral-400 mb-4">No orders yet.</p>
                  <button onClick={() => router.push('/collection')} className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors">
                    Browse Collection →
                  </button>
                </div>
              )}
              {orders?.map(order => (
                <div key={order._id} className="border border-neutral-200">
                  <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-100">
                    <div>
                      <p className="text-[12px] text-black mb-0.5 font-medium">{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-[11px] text-neutral-400">
                        {new Date(order._creationTime).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-[10px] tracking-widest uppercase px-3 py-1 ${STATUS_STYLES[order.status] ?? 'text-neutral-500 bg-neutral-100'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-[13px] text-black mb-0.5">
                        {item.name}
                        <span className="text-neutral-400 ml-2 text-[11px]">{item.color} / {item.size} × {item.quantity}</span>
                      </p>
                    ))}
                    <p className="text-[12px] text-neutral-400 mt-2">
                      Total: ${(order.total / 100).toFixed(2)} CAD
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security sub-view */}
          {view === 'security' && (
            <div className="max-w-sm space-y-5">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Email Address</label>
                <div className="border border-neutral-100 px-4 py-3 text-[13px] text-neutral-400 bg-neutral-50">{email}</div>
              </div>

              {user?.passwordEnabled ? (
                <>
                  <div className="pt-4 border-t border-neutral-100">
                    <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-4">Change Password</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Current Password</label>
                        <input
                          type="password"
                          value={pw.current}
                          onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                          className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">New Password</label>
                        <input
                          type="password"
                          value={pw.next}
                          onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                          className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Confirm New Password</label>
                        <input
                          type="password"
                          value={pw.confirm}
                          onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                          className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors"
                        />
                      </div>
                    </div>
                    {pwError && <p className="text-red-500 text-[12px] mt-3">{pwError}</p>}
                    {pwSaved && <p className="text-green-600 text-[12px] mt-3">Password updated.</p>}
                    <button
                      onClick={handleChangePassword}
                      disabled={pwSaving || !pw.current || !pw.next || !pw.confirm}
                      className="mt-5 w-full bg-black text-white text-[10px] tracking-widest uppercase py-3.5 hover:bg-neutral-900 transition-colors disabled:opacity-50"
                    >
                      {pwSaving ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-neutral-100">
                  <p className="text-[12px] text-neutral-400">You signed in with a social account. Password management is handled by your provider.</p>
                </div>
              )}
            </div>
          )}

          {/* Addresses sub-view */}
          {view === 'addresses' && (
            <div className="space-y-4">
              {(!convexUser?.addresses || convexUser.addresses.length === 0) && !showAddForm && (
                <div className="py-12 text-center border border-dashed border-neutral-200">
                  <p className="text-[13px] text-neutral-400 mb-4">No addresses saved yet.</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-[10px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
                  >
                    + Add Address
                  </button>
                </div>
              )}

              {convexUser?.addresses?.map(a => (
                <div key={a.id} className="border border-neutral-200 px-5 py-4 flex items-start justify-between">
                  <div>
                    <p className="text-[13px] text-black mb-0.5">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                    <p className="text-[12px] text-neutral-400">{a.city}, {a.province} {a.postalCode}</p>
                    <p className="text-[12px] text-neutral-400">{a.country}</p>
                    {a.phone && <p className="text-[12px] text-neutral-400 mt-0.5">{a.phone}</p>}
                    {a.isDefault && (
                      <span className="inline-block mt-2 text-[9px] tracking-widest uppercase bg-neutral-100 text-neutral-500 px-2 py-0.5">Default</span>
                    )}
                  </div>
                  <button
                    onClick={() => removeAddress({ addressId: a.id })}
                    className="text-[10px] text-neutral-400 hover:text-black transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {convexUser?.addresses && convexUser.addresses.length > 0 && !showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-[10px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
                >
                  + Add Address
                </button>
              )}

              {showAddForm && (
                <div className="border border-neutral-200 p-6 space-y-4">
                  <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">New Address</p>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={addr.line1}
                      onChange={e => setAddr(a => ({ ...a, line1: e.target.value }))}
                      placeholder="123 Main St"
                      className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Apt / Suite (optional)</label>
                    <input
                      type="text"
                      value={addr.line2}
                      onChange={e => setAddr(a => ({ ...a, line2: e.target.value }))}
                      placeholder="Apt 4B"
                      className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">City</label>
                      <input
                        type="text"
                        value={addr.city}
                        onChange={e => setAddr(a => ({ ...a, city: e.target.value }))}
                        placeholder="Toronto"
                        className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Province / State</label>
                      <input
                        type="text"
                        value={addr.province}
                        onChange={e => setAddr(a => ({ ...a, province: e.target.value }))}
                        placeholder="Ontario"
                        className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Postal / ZIP</label>
                      <input
                        type="text"
                        value={addr.postalCode}
                        onChange={e => setAddr(a => ({ ...a, postalCode: e.target.value }))}
                        placeholder="M5V 1A1"
                        className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Country</label>
                      <input
                        type="text"
                        value={addr.country}
                        onChange={e => setAddr(a => ({ ...a, country: e.target.value }))}
                        className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-neutral-400 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={addr.phone}
                      onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))}
                      placeholder="+1 (416) 000-0000"
                      className="w-full border border-neutral-200 px-4 py-3 text-[13px] bg-transparent outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                    />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addr.isDefault}
                      onChange={e => setAddr(a => ({ ...a, isDefault: e.target.checked }))}
                      className="w-3.5 h-3.5 accent-black"
                    />
                    <span className="text-[11px] text-neutral-500">Set as default address</span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleAddAddress}
                      disabled={addrSaving || !addr.line1 || !addr.city || !addr.province || !addr.postalCode}
                      className="flex-1 bg-black text-white text-[10px] tracking-widest uppercase py-3.5 hover:bg-neutral-900 transition-colors disabled:opacity-50"
                    >
                      {addrSaving ? 'Saving…' : 'Save Address'}
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-6 border border-neutral-200 text-[10px] tracking-widest uppercase text-neutral-500 hover:border-black hover:text-black transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

function DashCard({ title, subtitle, icon, onClick }: { title: string; subtitle: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group border border-neutral-200 p-6 text-left hover:border-black transition-colors duration-200 flex flex-col gap-4"
    >
      <div className="text-neutral-400 group-hover:text-black transition-colors">{icon}</div>
      <div>
        <p className="text-[13px] text-black font-medium mb-0.5">{title}</p>
        <p className="text-[11px] text-neutral-400 truncate">{subtitle}</p>
      </div>
      <div className="text-[10px] tracking-widest uppercase text-neutral-400 group-hover:text-black transition-colors">
        View →
      </div>
    </button>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

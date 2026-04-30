'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, useClerk } from '@clerk/nextjs'
import { useCart } from '@/lib/cartContext'

export function Nav() {
  const { count, openCart } = useCart()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')

  const [isPastHero, setIsPastHero] = useState(false)

  useEffect(() => {
    if (!isHome) return
    const handleScroll = () => {
      const heroGrid = document.getElementById('hero-grid')
      if (heroGrid) {
        setIsPastHero(heroGrid.getBoundingClientRect().bottom <= 60)
      } else {
        setIsPastHero(window.scrollY > window.innerHeight * 3)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  const isTransparent = isHome && !isPastHero && !menuOpen
  const showLogo = !isHome || isPastHero

  const navClasses = isTransparent ? 'bg-transparent border-transparent' : 'bg-white border-neutral-200'
  const linkClasses = isTransparent ? 'text-white/80 hover:text-white' : 'text-neutral-500 hover:text-black'
  const iconClasses = isTransparent ? 'text-white/90 hover:text-white' : 'text-neutral-500 hover:text-black'
  const badgeClasses = isTransparent ? 'bg-white text-black' : 'bg-black text-white'
  const hamburgerLineClasses = isTransparent ? 'bg-white' : 'bg-black'

  const initials = user
    ? (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
    : ''

  if (isAuthPage) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-neutral-200" style={{ height: 'var(--nav-height, 60px)' }}>
        <div className="flex items-center justify-center h-full">
          <Link href="/" className="font-serif text-sm tracking-[0.30em] uppercase text-black hover:text-neutral-500 transition-colors">
            ORIGIN OF ONE
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 border-b ${navClasses}`}
      style={{ height: 'var(--nav-height, 60px)' }}
    >
      <div className="flex items-center justify-between h-full px-6 md:px-10">

        {/* Left nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/collection" className={`text-[10px] tracking-widest uppercase transition-colors link-underline ${linkClasses}`}>Collections</Link>
          <Link href="/new-in" className={`text-[10px] tracking-widest uppercase transition-colors link-underline ${linkClasses}`}>New In</Link>
          <Link href="/about" className={`text-[10px] tracking-widest uppercase transition-colors link-underline ${linkClasses}`}>About</Link>
        </div>

        {/* Centre logo */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 top-1/2 transition-all duration-500 ${
            showLogo ? 'opacity-100 pointer-events-auto -translate-y-1/2' : 'opacity-0 pointer-events-none -translate-y-[30%]'
          }`}
        >
          <Link
            href="/"
            className={`font-serif text-sm tracking-[0.30em] uppercase transition-colors ${
              isTransparent ? 'text-white hover:text-white/80' : 'text-black hover:text-neutral-500'
            }`}
          >
            ORIGIN OF ONE
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-1"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px transition-all duration-300 ${hamburgerLineClasses} ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-5 h-px transition-all duration-300 ${hamburgerLineClasses} ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px transition-all duration-300 ${hamburgerLineClasses} ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>

        {/* Right icons */}
        <div className="flex items-center gap-5">
          <button aria-label="Search" className={`transition-colors ${iconClasses}`}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Account — shows initials bubble if signed in, otherwise icon */}
          {isLoaded && (
            user ? (
              <Link href="/account" className={`hidden md:flex items-center justify-center transition-colors ${iconClasses}`} aria-label="Account">
                {initials ? (
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border ${isTransparent ? 'border-white/60 text-white' : 'border-neutral-300 text-neutral-600'}`}>
                    {initials.toUpperCase()}
                  </span>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </Link>
            ) : (
              <Link href="/sign-in" className={`hidden md:block text-[10px] tracking-widest uppercase transition-colors ${linkClasses}`}>
                Sign In
              </Link>
            )
          )}

          {/* Cart */}
          <button
            onClick={openCart}
            className={`relative transition-colors ${iconClasses}`}
            aria-label="Cart"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span className={`absolute -top-2 -right-2 rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-medium transition-colors ${badgeClasses}`}>
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <div className={`md:hidden bg-white border-t border-neutral-200 overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-72' : 'max-h-0'}`}>
        <div className="flex flex-col px-6 py-5 gap-5">
          <Link href="/collection" className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>Collections</Link>
          <Link href="/new-in" className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>New In</Link>
          <Link href="/about" className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>About</Link>
          {user ? (
            <>
              <Link href="/account" className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>Account</Link>
              <button
                onClick={() => { setMenuOpen(false); signOut().then(() => {}) }}
                className="text-[11px] tracking-widest uppercase text-neutral-400 text-left"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/sign-in" className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

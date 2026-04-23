'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/lib/cartContext'

export function Nav() {
  const { count, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  // Scroll state for dynamic navbar
  const [isPastHero, setIsPastHero] = useState(false)

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      // Track when the hero section is completely out of view
      const heroGrid = document.getElementById('hero-grid')
      if (heroGrid) {
        const rect = heroGrid.getBoundingClientRect()
        // If the bottom of the hero grid is at or above the nav (60px), it's gone.
        setIsPastHero(rect.bottom <= 60)
      } else {
        setIsPastHero(window.scrollY > window.innerHeight * 3)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initialize on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  // Determine styles based on scroll state and route.
  // It now stays transparent until the hero section completely passes.
  const isTransparent = isHome && !isPastHero && !menuOpen
  const showLogo = !isHome || isPastHero

  const navClasses = isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white border-neutral-200'

  const linkClasses = isTransparent
    ? 'text-white/80 hover:text-white'
    : 'text-neutral-500 hover:text-black'

  const iconClasses = isTransparent
    ? 'text-white/90 hover:text-white'
    : 'text-neutral-500 hover:text-black'

  const badgeClasses = isTransparent
    ? 'bg-white text-black'
    : 'bg-black text-white'

  const hamburgerLineClasses = isTransparent
    ? 'bg-white'
    : 'bg-black'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-colors duration-300 border-b ${navClasses}`}
      style={{ height: 'var(--nav-height, 60px)' }}
    >
      <div className="flex items-center justify-between h-full px-6 md:px-10">

        {/* ── Left nav links (desktop) ── */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/collection" className={`text-[10px] tracking-widest uppercase transition-colors link-underline ${linkClasses}`}>
            Collections
          </Link>
          <Link href="/collection" className={`text-[10px] tracking-widest uppercase transition-colors link-underline ${linkClasses}`}>
            New In
          </Link>
          <Link href="/about" className={`text-[10px] tracking-widest uppercase transition-colors link-underline ${linkClasses}`}>
            About US
          </Link>
        </div>

        {/* ── Centre logo ──
            Fades in seamlessly once the main hero logo scrolls away ── */}
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

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-1"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-px transition-all duration-300 ${hamburgerLineClasses} ${menuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
          <span className={`block w-5 h-px transition-all duration-300 ${hamburgerLineClasses} ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px transition-all duration-300 ${hamburgerLineClasses} ${menuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
        </button>

        {/* ── Right icons ── */}
        <div className="flex items-center gap-5">
          <button aria-label="Search" className={`transition-colors ${iconClasses}`}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <Link href="/account" className={`hidden md:block transition-colors ${iconClasses}`} aria-label="Account">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
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

      {/* ── Mobile slide-down menu ── */}
      <div className={`md:hidden bg-white border-t border-neutral-200 overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-64' : 'max-h-0'}`}>
        <div className="flex flex-col px-6 py-5 gap-5">
          <Link href="/collection" className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>Collections</Link>
          <Link href="/collection" className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>New In</Link>
          <Link href="/about"      className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/account"    className="text-[11px] tracking-widest uppercase text-black" onClick={() => setMenuOpen(false)}>Account</Link>
        </div>
      </div>
    </nav>
  )
}
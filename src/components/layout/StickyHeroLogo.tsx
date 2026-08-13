'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'

const LogoLandedContext = createContext(false)
export function useLogoLanded() {
  return useContext(LogoLandedContext)
}

export function HeroLogoLandedProvider({
  heroGridId,
  children,
}: {
  heroGridId: string
  children: React.ReactNode
}) {
  const [landed, setLanded] = useState(false)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const heroGrid = document.getElementById(heroGridId)
    const logoText = document.getElementById('hero-sticky-logo-text')
    if (!heroGrid || !logoText) return

    const LEAD_PX = 120

    function update() {
      if (!heroGrid || !logoText) return
      const heroRect = heroGrid.getBoundingClientRect()
      const logoRect = logoText.getBoundingClientRect()
      setLanded(logoRect.bottom >= heroRect.bottom - LEAD_PX)
    }

    function onScroll() {
      if (frame.current !== null) return
      frame.current = requestAnimationFrame(() => {
        frame.current = null
        update()
      })
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [heroGridId])

  return (
    <LogoLandedContext.Provider value={landed}>
      {children}
    </LogoLandedContext.Provider>
  )
}

export function StickyHeroLogo() {
  return (
    <div
      style={{
        gridColumn: 1,
        gridRow: 1,
        zIndex: 20,
        pointerEvents: 'none',
        ['--logo-h' as any]: 'clamp(2.5rem, 8vw, 8rem)',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: '50vh',
          height: 'calc(var(--logo-h) * 0.88 / 2)',
        }}
      >
        <h1
          id="hero-sticky-logo-text"
          className="font-serif text-white text-center leading-[0.88] tracking-tight select-none mix-blend-difference"
          style={{
            position: 'absolute',
            left: 0, right: 0,
            bottom: 0,
            fontSize: 'var(--logo-h)',
            whiteSpace: 'nowrap',
            padding: '0 1rem',
          }}
        >
          ORIGIN OF ONE
        </h1>
      </div>
    </div>
  )
}

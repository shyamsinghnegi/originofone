'use client'

import { useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const isFirstRun = useRef(true)

  useLayoutEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    const el = ref.current
    if (!el) return
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: true }
    )
  }, [pathname])

  return (
    <div ref={ref} key={pathname}>
      {children}
    </div>
  )
}

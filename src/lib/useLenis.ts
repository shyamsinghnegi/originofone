'use client'

import { useEffect } from 'react'

export function useLenis() {
  useEffect(() => {
    let lenis: any

    async function init() {
      const { default: Lenis } = await import('@studio-freight/lenis')
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
      })

      function raf(time: number) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)

      // expose globally for logo scroll
      ;(window as any).__lenis = lenis
    }

    init()

    return () => {
      if (lenis) lenis.destroy()
    }
  }, [])
}

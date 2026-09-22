'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { setLenis } from '@/lib/lenis'

export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
    })
    setLenis(lenis)

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  return null
}

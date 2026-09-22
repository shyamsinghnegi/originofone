'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getLenis } from '@/lib/lenis'

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    const resetScroll = () => {
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(0, { immediate: true })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      }
    }

    // Fire immediately
    resetScroll()

    // Fire again slightly later to ensure it beats Next.js native scroll restoration
    const t = setTimeout(resetScroll, 50)
    
    return () => clearTimeout(t)
  }, [pathname])

  return null
}

'use client'
import { useEffect } from 'react'

export function ZoomLock() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '=' || e.key === '-' || e.key === '0' || e.key === '+')
      ) {
        e.preventDefault()
      }
    }

    // passive:false only on wheel (needed to preventDefault on ctrl+wheel).
    // Regular scroll goes through Lenis unblocked.
    document.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('wheel', handleWheel)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return null
}

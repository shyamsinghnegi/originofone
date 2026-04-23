'use client'
import { useEffect } from 'react'

export function ZoomLock() {
  useEffect(() => {
    // 1. Prevent Trackpad Pinch-to-Zoom on Mac & Ctrl+Scroll on Windows
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    // 2. Prevent Keyboard Zoom Shortcuts (Cmd/Ctrl + / - / 0)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === '=' || e.key === '-' || e.key === '0' || e.key === '+')
      ) {
        e.preventDefault()
      }
    }

    // Note: { passive: false } is required to allow preventDefault() on wheel events
    document.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('wheel', handleWheel)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return null
}
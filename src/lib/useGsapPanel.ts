'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

interface PanelOptions {
  /**
   * Direction the panel slides in from.
   * 'none' = fade + scale (centered modals).
   * 'top'  = short downward fade-slide (dropdown-style panels, e.g. search).
   */
  from?: 'right' | 'left' | 'bottom' | 'top' | 'none'
  duration?: number
}

function hiddenVars(from: PanelOptions['from']) {
  if (from === 'left') return { xPercent: -100 }
  if (from === 'bottom') return { yPercent: 100 }
  if (from === 'top') return { opacity: 0, y: -12 }
  if (from === 'none') return { opacity: 0, scale: 0.96 }
  return { xPercent: 100 } // 'right' (default)
}

function shownVars(from: PanelOptions['from']) {
  if (from === 'left' || from === 'right') return { xPercent: 0 }
  if (from === 'bottom') return { yPercent: 0 }
  if (from === 'top') return { opacity: 1, y: 0 }
  return { opacity: 1, scale: 1 } // 'none'
}

/**
 * Drives a GSAP open/close animation for a panel (drawer, modal, overlay) plus
 * its backdrop, replacing plain CSS transitions so timing/easing is consistent
 * across the site. Panel and backdrop refs are optional independently — pass
 * only what applies to a given component.
 */
export function useGsapPanel(
  isOpen: boolean,
  panelRef: React.RefObject<HTMLElement | null>,
  backdropRef?: React.RefObject<HTMLElement | null>,
  options: PanelOptions = {}
) {
  const { from = 'right', duration = 0.45 } = options

  // Mount-only: snap to the correct resting position with no animation, using
  // gsap.set (an absolute assignment, not additive) so it's safe even if this
  // runs twice back-to-back (React Strict Mode double-invokes effects in dev).
  useLayoutEffect(() => {
    const panel = panelRef.current
    const backdrop = backdropRef?.current
    if (panel) gsap.set(panel, isOpen ? shownVars(from) : hiddenVars(from))
    if (backdrop) gsap.set(backdrop, { autoAlpha: isOpen ? 1 : 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Animate on every subsequent isOpen change (skip the initial mount render,
  // which is handled above by the mount-only layout effect instead).
  const isFirstRun = useRef(true)
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    const panel = panelRef.current
    const backdrop = backdropRef?.current
    const ease = isOpen ? 'power3.out' : 'power3.in'

    if (panel) {
      gsap.to(panel, { ...(isOpen ? shownVars(from) : hiddenVars(from)), duration, ease, overwrite: true })
    }
    if (backdrop) {
      gsap.to(backdrop, { autoAlpha: isOpen ? 1 : 0, duration: duration * 0.8, ease: 'power2.out', overwrite: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])
}

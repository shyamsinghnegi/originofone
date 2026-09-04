'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useToast, ToastData } from '@/lib/toastContext'

export function ToastStack() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="fixed bottom-5 right-5 z-400 flex flex-col-reverse gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={() => dismissToast(t.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 14, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
    )
  }, [])

  function handleDismiss() {
    const el = ref.current
    if (!el) { onDismiss(); return }
    gsap.to(el, { autoAlpha: 0, x: 24, duration: 0.25, ease: 'power2.in', onComplete: onDismiss })
  }

  return (
    <div
      ref={ref}
      role="status"
      className="pointer-events-auto flex items-center gap-3 bg-black text-white pl-3 pr-4 py-3 rounded-full shadow-lg max-w-xs"
    >
      {toast.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={toast.image} alt="" className="w-8 h-9 rounded-md object-cover shrink-0" />
      )}
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span className="text-[12px] leading-tight flex-1">{toast.message}</span>
      <button onClick={handleDismiss} aria-label="Dismiss" className="text-white/60 hover:text-white transition-colors shrink-0">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

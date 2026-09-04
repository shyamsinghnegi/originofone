'use client'

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react'

export interface ToastData {
  id: number
  message: string
  image?: string
}

interface ToastContextType {
  toasts: ToastData[]
  showToast: (message: string, image?: string) => void
  dismissToast: (id: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const TOAST_DURATION_MS = 2600

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const nextId = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, image?: string) => {
    const id = nextId.current++
    setToasts(prev => [...prev, { id, message, image }])
    setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
  }, [dismissToast])

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

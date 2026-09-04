'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface QuickAddProduct {
  productId: string
  slug: string
  name: string
  price: number
  originalPrice?: number
  image?: string
  variants: { color: string; size: string; stock: number }[]
}

interface QuickAddContextType {
  product: QuickAddProduct | null
  open: (product: QuickAddProduct) => void
  close: () => void
}

const QuickAddContext = createContext<QuickAddContextType | null>(null)

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<QuickAddProduct | null>(null)

  return (
    <QuickAddContext.Provider
      value={{
        product,
        open: (p) => setProduct(p),
        close: () => setProduct(null),
      }}
    >
      {children}
    </QuickAddContext.Provider>
  )
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext)
  if (!ctx) throw new Error('useQuickAdd must be used within QuickAddProvider')
  return ctx
}

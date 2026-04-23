'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  size: string
  color: string
  qty: number
  image?: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (id: string, size: string) => void
  updateQty: (id: string, size: string, qty: number) => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([
    { id: '1', name: 'Tundra Wool Overcoat', price: 348, size: 'M', color: 'Stone Grey', qty: 1 },
    { id: '2', name: 'Wool Beanie', price: 58, size: 'One Size', color: 'Charcoal', qty: 1 },
  ])
  const [isOpen, setIsOpen] = useState(false)

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.size === item.size)
      if (existing) return prev.map(i => i.id === item.id && i.size === item.size ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, item]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string, size: string) =>
    setItems(prev => prev.filter(i => !(i.id === id && i.size === size)))

  const updateQty = (id: string, size: string, qty: number) => {
    if (qty < 1) return removeItem(id, size)
    setItems(prev => prev.map(i => i.id === id && i.size === size ? { ...i, qty } : i))
  }

  return (
    <CartContext.Provider value={{ items, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false), addItem, removeItem, updateQty, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

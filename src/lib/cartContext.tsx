'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useQuery, useMutation, useConvexAuth } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { Id } from '@/../convex/_generated/dataModel'

export interface CartItem {
  productId: string   // Convex _id
  slug: string        // for /product/<slug> links
  name: string
  price: number       // in CAD dollars
  size: string
  color: string
  qty: number
  image: string
}

export interface AddItemInput {
  productId: string
  slug: string
  name: string
  price: number
  size: string
  color: string
  qty?: number
  image?: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: AddItemInput) => void
  removeItem: (productId: string, color: string, size: string) => void
  updateQty: (productId: string, color: string, size: string, qty: number) => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useConvexAuth()

  const convexCart = useQuery(api.cart.get, isAuthenticated ? undefined : 'skip')
  const upsertItem  = useMutation(api.cart.upsertItem)
  const removeConvex = useMutation(api.cart.removeItem)
  const updateConvex = useMutation(api.cart.updateQuantity)

  const [localItems, setLocalItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const items: CartItem[] = isAuthenticated && convexCart
    ? convexCart.items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        price: i.price,
        size: i.size,
        color: i.color,
        qty: i.quantity,
        image: i.image,
      }))
    : localItems

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  const addItem = (item: AddItemInput) => {
    const qty = item.qty ?? 1
    const image = item.image ?? ''

    if (isAuthenticated) {
      upsertItem({
        item: {
          productId: item.productId as Id<'products'>,
          slug: item.slug,
          name: item.name,
          price: item.price,
          quantity: qty,
          color: item.color,
          size: item.size,
          image,
        },
      }).catch(console.error)
    } else {
      setLocalItems(prev => {
        const existing = prev.find(
          i => i.productId === item.productId && i.color === item.color && i.size === item.size
        )
        if (existing) {
          return prev.map(i =>
            i.productId === item.productId && i.color === item.color && i.size === item.size
              ? { ...i, qty: i.qty + qty }
              : i
          )
        }
        return [...prev, { productId: item.productId, slug: item.slug, name: item.name, price: item.price, size: item.size, color: item.color, qty, image }]
      })
    }
    setIsOpen(true)
  }

  const removeItem = (productId: string, color: string, size: string) => {
    if (isAuthenticated) {
      removeConvex({ productId: productId as Id<'products'>, color, size }).catch(console.error)
    } else {
      setLocalItems(prev =>
        prev.filter(i => !(i.productId === productId && i.color === color && i.size === size))
      )
    }
  }

  const updateQty = (productId: string, color: string, size: string, qty: number) => {
    if (qty < 1) { removeItem(productId, color, size); return }
    if (isAuthenticated) {
      updateConvex({ productId: productId as Id<'products'>, color, size, quantity: qty }).catch(console.error)
    } else {
      setLocalItems(prev =>
        prev.map(i =>
          i.productId === productId && i.color === color && i.size === size ? { ...i, qty } : i
        )
      )
    }
  }

  return (
    <CartContext.Provider value={{
      items, isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem, removeItem, updateQty,
      total, count,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

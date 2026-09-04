'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuickAdd, QuickAddProduct } from '@/lib/quickAddContext'
import { useCart } from '@/lib/cartContext'
import { useToast } from '@/lib/toastContext'
import { stopLenis, startLenis } from '@/lib/lenis'
import { useGsapPanel } from '@/lib/useGsapPanel'

const CLOSE_ANIM_MS = 250

export function QuickAddModal() {
  const { product, close } = useQuickAdd()
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Keep rendering the last product briefly after `product` clears, so the
  // panel has content to animate out with instead of vanishing instantly.
  const [displayProduct, setDisplayProduct] = useState<QuickAddProduct | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (product) {
      setDisplayProduct(product)
      setMounted(true)
      setSelectedSize(null)
      setError(null)
    } else if (mounted) {
      const t = setTimeout(() => setMounted(false), CLOSE_ANIM_MS)
      return () => clearTimeout(t)
    }
  }, [product, mounted])

  useGsapPanel(!!product, panelRef, backdropRef, { from: 'none', duration: CLOSE_ANIM_MS / 1000 })

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden'
      stopLenis()
    } else {
      document.body.style.overflow = ''
      startLenis()
    }
    return () => {
      document.body.style.overflow = ''
      startLenis()
    }
  }, [product])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  if (!mounted || !displayProduct) return null
  const item = displayProduct

  const sizes = [...new Set(item.variants.map(v => v.size))]
  const selectedVariant = item.variants.find(
    v => v.size === selectedSize && v.stock > 0
  ) ?? item.variants.find(v => v.size === selectedSize)

  function handleAdd(goToCheckout: boolean) {
    if (!selectedSize) {
      setError('Select a size')
      return
    }
    if (!selectedVariant || selectedVariant.stock <= 0) {
      setError('This size is out of stock')
      return
    }
    addItem({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      size: selectedVariant.size,
      color: selectedVariant.color,
      image: item.image,
    }, { openDrawer: goToCheckout })
    close()
    if (goToCheckout) {
      window.location.href = '/checkout'
    } else {
      showToast(`Added ${item.name} (${selectedVariant.size}) to your bag`, item.image)
    }
  }

  return (
    <>
      <div
        ref={backdropRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-300"
        style={{ pointerEvents: product ? 'auto' : 'none' }}
        onClick={close}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick add ${item.name}`}
        className="fixed inset-0 z-301 flex items-center justify-center px-6"
        style={{ pointerEvents: 'none' }}
      >
        <div
          ref={panelRef}
          className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
          style={{ pointerEvents: product ? 'auto' : 'none' }}
        >
          <div className="flex gap-4 p-5 border-b border-neutral-100">
            <div className="w-16 h-20 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] text-black leading-tight mb-1">{item.name}</p>
              <div className="flex items-center gap-2">
                {item.originalPrice && (
                  <span className="text-[13px] text-neutral-400 line-through">${item.originalPrice}</span>
                )}
                <span className="text-[13px] text-neutral-600">${item.price} CAD</span>
              </div>
            </div>
            <button
              onClick={close}
              aria-label="Close"
              className="text-neutral-400 hover:text-black transition-colors shrink-0 h-fit"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="p-5">
            <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-3">Select Size</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {sizes.map(size => {
                const inStock = item.variants.some(v => v.size === size && v.stock > 0)
                return (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setError(null) }}
                    disabled={!inStock}
                    className={`h-10 rounded-lg text-[12px] border transition-colors ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : inStock
                        ? 'border-neutral-200 text-black hover:border-black'
                        : 'border-neutral-100 text-neutral-300 line-through cursor-not-allowed'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>

            {error && <p className="text-red-500 text-[12px] mb-3">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => handleAdd(false)}
                className="flex-1 border border-black text-black text-[11px] tracking-widest uppercase py-3.5 rounded-full hover:bg-neutral-50 transition-colors"
              >
                Add to Bag
              </button>
              <button
                onClick={() => handleAdd(true)}
                className="flex-1 bg-black text-white text-[11px] tracking-widest uppercase py-3.5 rounded-full hover:bg-neutral-900 transition-colors"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

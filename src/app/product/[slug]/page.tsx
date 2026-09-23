'use client'

import { useState, useMemo, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useCachedQuery } from '@/lib/useCachedQuery'
import { useCart } from '@/lib/cartContext'
import { ProductCard, Footer, COLOR_MAP, COLOR_TO_BG } from '@/components/ui'
import { categoryToSlug } from '@/components/ProductGridPage'

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  if (tags.includes('limited')) return 'Limited'
  return undefined
}

const EDITORIAL_GALLERY_FALLBACKS: Record<string, string[]> = {
  knitwear: [
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1200&q=80',
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  ],
  layering: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=80',
  ],
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { addItem, openCart } = useCart()
  const router = useRouter()
  const { user } = useUser()

  const product = useCachedQuery(api.products.getBySlug, { slug }, `product:${slug}`)
  const related = useCachedQuery(
    api.products.getRelated,
    product ? { category: product.category, excludeSlug: product.slug } : 'skip',
    product ? `related:${product.category}:${product.slug}` : 'skip'
  )
  const toggleWishlist = useMutation(api.wishlist.toggle)
  const wishlist = useQuery(api.wishlist.listMine, user ? undefined : 'skip')

  const isWishlisted = product && wishlist?.some(w => w.product?._id === product._id)

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState<'details' | 'washcare' | 'shipping'>('details')
  const [added, setAdded] = useState(false)
  const [activeMobileImg, setActiveMobileImg] = useState(0)

  useEffect(() => {
    setActiveMobileImg(0)
  }, [slug])

  const uniqueColors = useMemo(() => {
    if (!product) return []
    return [...new Set(product.variants.map(v => v.color))]
  }, [product])

  const availableSizes = useMemo(() => {
    if (!product) return []
    const colorVariants = selectedColor
      ? product.variants.filter(v => v.color === selectedColor)
      : product.variants
    return [...new Set(colorVariants.map(v => v.size))]
  }, [product, selectedColor])

  const soldOutSizes = useMemo(() => {
    if (!product) return new Set<string>()
    const colorVariants = selectedColor
      ? product.variants.filter(v => v.color === selectedColor)
      : product.variants
    return new Set(colorVariants.filter(v => v.stock === 0).map(v => v.size))
  }, [product, selectedColor])

  const catKey = (product?.category ?? '').toLowerCase()
  const fallbackList = EDITORIAL_GALLERY_FALLBACKS[catKey] ?? EDITORIAL_GALLERY_FALLBACKS.knitwear

  const galleryImages = useMemo(() => {
    if (!product) return fallbackList
    if (product.images && product.images.length > 1) {
      return product.images
    }
    if (product.images && product.images.length === 1) {
      return [product.images[0], fallbackList[1] ?? fallbackList[0], fallbackList[2] ?? fallbackList[0]]
    }
    return fallbackList
  }, [product, fallbackList])

  const heroImage = galleryImages[0]
  const scrollImages = galleryImages.slice(1)

  // Init selections when product loads
  const effectiveColor = selectedColor || uniqueColors[0] || ''
  const effectiveSize = selectedSize || availableSizes.find(s => !soldOutSizes.has(s)) || ''

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: effectiveSize,
      color: effectiveColor,
      qty,
      image: heroImage ?? '',
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 800)
  }

  const handleBuyNow = () => {
    if (!product) return
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      size: effectiveSize,
      color: effectiveColor,
      qty,
      image: heroImage ?? '',
    })
    router.push('/checkout')
  }

  // Loading skeleton
  if (product === undefined) {
    return (
      <div className="pt-20 min-h-screen bg-neutral-50/40">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="h-3 w-44 rounded bg-neutral-200 animate-pulse mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_400px] xl:grid-cols-[1.1fr_1.1fr_440px] gap-5 items-start">
            <div className="hidden lg:block h-[calc(100vh-120px)] rounded-2xl bg-neutral-200 animate-pulse" />
            <div className="flex flex-col gap-5">
              <div className="h-[calc(100vh-120px)] rounded-2xl bg-neutral-200 animate-pulse" />
              <div className="h-[calc(100vh-120px)] rounded-2xl bg-neutral-200 animate-pulse" />
            </div>
            <div className="h-[600px] rounded-2xl bg-neutral-200 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  // Not found
  if (product === null) {
    return (
      <div className="pt-20 min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="font-serif text-3xl text-neutral-400">Product not found.</p>
        <Link href="/collection/all" className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5">
          Browse Collection →
        </Link>
      </div>
    )
  }

  const firstColor = effectiveColor
  const bgColor = COLOR_TO_BG[firstColor] ?? '#d8d8d8'
  const badge = badgeFromTags(product.tags)

  return (
    <>
      <div className="pt-16 md:pt-20 bg-neutral-50/30 min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-3 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/collection/${categoryToSlug(product.category)}`} className="hover:text-black transition-colors">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_400px] xl:grid-cols-[1.1fr_1.1fr_440px] gap-4 md:gap-5 items-start">

            {/* ── 1. LEFT FIXED HERO IMAGE (Desktop Sticky) ── */}
            <div className="hidden lg:block sticky top-[80px] h-[calc(100vh-100px)] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm relative group">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={`${product.name} - Front View`}
                  fill
                  priority
                  sizes="(max-width: 1280px) 40vw, 35vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: bgColor }}>
                  <div className="w-32 h-64 bg-black/10 rounded-full blur-sm" />
                </div>
              )}
              {badge && (
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-black text-[10px] tracking-widest uppercase px-3.5 py-1.5 rounded-full font-mono font-medium shadow-sm z-10">
                  {badge}
                </span>
              )}
            </div>

            {/* ── MOBILE GALLERY (Mobile Only, < lg) ── */}
            <div className="lg:hidden flex flex-col gap-3">
              {/* Main active image */}
              <div className="relative aspect-4/5 sm:aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 shadow-sm">
                {galleryImages.length > 0 ? (
                  galleryImages.map((src, i) => (
                    <div
                      key={i}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        activeMobileImg === i ? 'opacity-100 z-1' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.name} - View ${i + 1}`}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center"
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: bgColor }} />
                )}

                {badge && (
                  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full font-mono font-medium shadow-sm z-10">
                    {badge}
                  </span>
                )}

                {/* Left and Right navigation buttons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveMobileImg(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 text-black shadow-md flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMobileImg(i => (i + 1) % galleryImages.length)}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 text-black shadow-md flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Counter indicator */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-full z-10">
                    {activeMobileImg + 1} / {galleryImages.length}
                  </div>
                )}
              </div>

              {/* Small thumbnail boxes */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-3 gap-2.5">
                  {galleryImages.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveMobileImg(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 transition-all duration-200 border-2 cursor-pointer ${
                        activeMobileImg === i
                          ? 'border-black ring-2 ring-black/10 scale-[1.02] shadow-sm opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        fill
                        sizes="120px"
                        className="object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── 2. SCROLLABLE GALLERY COLUMN (Desktop Only) ── */}
            <div className="hidden lg:flex flex-col gap-4 md:gap-5">
              {scrollImages && scrollImages.map((src, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-neutral-100 relative min-h-[calc(100vh-100px)] w-full shadow-sm group"
                >
                  <Image
                    src={src}
                    alt={`${product.name} - Detail Angle ${i + 1}`}
                    fill
                    sizes="(max-width: 1280px) 40vw, 35vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              ))}
            </div>

            {/* ── 3. PRODUCT INFO & DETAILS (Desktop Sticky) ── */}
            <div className="lg:sticky lg:top-[80px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto hide-scrollbar bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
              
              {/* Title & Wishlist Flag */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight leading-snug">
                    {product.name}
                  </h1>
                </div>

                {/* Wishlist ribbon button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (!user) return router.push('/sign-in')
                    if (product) toggleWishlist({ productId: product._id })
                  }}
                  aria-label="Toggle wishlist"
                  className={`p-2 rounded-full border border-neutral-200 hover:border-black transition-colors shrink-0 ${
                    isWishlisted ? 'text-red-500 bg-red-50/50' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  {isWishlisted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-xl md:text-2xl font-semibold text-black font-mono">
                  ${product.price.toLocaleString()} CAD
                </span>
                {product.compareAtPrice && (
                  <span className="text-base text-neutral-400 line-through font-mono">
                    ${product.compareAtPrice.toLocaleString()} CAD
                  </span>
                )}
              </div>

              {/* Colour selector (if variants exist) */}
              {uniqueColors.length > 1 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Colour
                    </p>
                    <p className="text-[12px] font-medium text-black">{effectiveColor}</p>
                  </div>
                  <div className="flex gap-2.5">
                    {uniqueColors.map(c => (
                      <button
                        key={c}
                        onClick={() => { setSelectedColor(c); setSelectedSize('') }}
                        title={c}
                        className={`w-7 h-7 rounded-full border transition-all ${
                          effectiveColor === c
                            ? 'outline-2 outline-black outline-offset-2 border-white scale-105'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                        style={{ background: COLOR_MAP[c] ?? '#ccc' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector & Size Guide */}
              {availableSizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                      Select Size
                    </p>
                    <Link
                      href="/sizing-guide"
                      className="text-[11px] text-neutral-500 hover:text-black font-mono uppercase tracking-wider underline transition-colors"
                    >
                      Size Guide
                    </Link>
                  </div>

                  {/* Rounded Pill Size Buttons */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableSizes.map(s => {
                      const isSoldOut = soldOutSizes.has(s)
                      const isSelected = effectiveSize === s
                      return (
                        <button
                          key={s}
                          onClick={() => !isSoldOut && setSelectedSize(s)}
                          disabled={isSoldOut}
                          className={`py-2.5 rounded-full text-[12px] font-mono font-medium transition-all ${
                            isSoldOut
                              ? 'bg-neutral-100 text-neutral-300 border border-neutral-200 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-black text-white border border-black shadow-sm'
                              : 'bg-white text-black border border-neutral-200 hover:border-black'
                          }`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-mono">
                  Quantity
                </span>
                <div className="flex items-center border border-neutral-200 rounded-full px-2 py-1">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-black transition-colors text-base"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-[13px] font-mono font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-black transition-colors text-base"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: ADD TO BAG & BUY NOW */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={availableSizes.length > 0 && soldOutSizes.has(effectiveSize)}
                  className={`flex-1 py-3.5 rounded-full border text-[11px] tracking-widest uppercase font-semibold transition-all ${
                    added
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-neutral-300 bg-white text-black hover:border-black disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {added ? '✓ Added' : 'Add to Bag'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={availableSizes.length > 0 && soldOutSizes.has(effectiveSize)}
                  className="flex-1 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 text-[11px] tracking-widest uppercase font-semibold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* ── TABS: Details & Description | Washcare | Shipping ── */}
              <div className="border-t border-neutral-200 pt-6">
                <div className="flex border-b border-neutral-200 gap-6 mb-5">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-2.5 text-[12px] uppercase tracking-wider font-mono transition-colors relative ${
                      activeTab === 'details'
                        ? 'text-black font-semibold border-b-2 border-black -mb-px'
                        : 'text-neutral-400 hover:text-black'
                    }`}
                  >
                    Details &amp; Description
                  </button>
                  <button
                    onClick={() => setActiveTab('washcare')}
                    className={`pb-2.5 text-[12px] uppercase tracking-wider font-mono transition-colors relative ${
                      activeTab === 'washcare'
                        ? 'text-black font-semibold border-b-2 border-black -mb-px'
                        : 'text-neutral-400 hover:text-black'
                    }`}
                  >
                    Washcare
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`pb-2.5 text-[12px] uppercase tracking-wider font-mono transition-colors relative ${
                      activeTab === 'shipping'
                        ? 'text-black font-semibold border-b-2 border-black -mb-px'
                        : 'text-neutral-400 hover:text-black'
                    }`}
                  >
                    Shipping
                  </button>
                </div>

                {/* Tab content area */}
                <div className="text-[13px] text-neutral-600 leading-relaxed space-y-4">
                  {activeTab === 'details' && (
                    <>
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-black font-semibold mb-1.5">
                          Details
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-neutral-500 text-[12px]">
                          <li>100% premium combed organic cotton</li>
                          <li>280 GSM heavyweight structured jersey</li>
                          <li>Oversized silhouette with structured shoulder drape</li>
                          <li>Ethically constructed with reinforced twin-needle hems</li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-black font-semibold mb-1.5">
                          Description
                        </p>
                        <p className="text-neutral-600 text-[13px] leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-wider text-black font-semibold mb-1">
                          Model Measurement
                        </p>
                        <p className="text-[12px] text-neutral-500">
                          Model is 6&apos;1&quot; wearing size L.
                        </p>
                      </div>
                    </>
                  )}

                  {activeTab === 'washcare' && (
                    <div className="space-y-2 text-[12px] text-neutral-500">
                      <p>• Machine wash cold inside out with similar colours (30°C max).</p>
                      <p>• Do not tumble dry. Reshape while damp and dry flat.</p>
                      <p>• Warm iron on reverse side. Do not iron directly over graphics.</p>
                      <p>• Do not dry clean or use chlorine-based bleaches.</p>
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="space-y-2 text-[12px] text-neutral-500">
                      <p>• <strong>Free standard shipping</strong> across Canada on all orders over $150 CAD.</p>
                      <p>• Orders dispatched within 24–48 hours with full end-to-end tracking.</p>
                      <p>• <strong>30-Day Returns</strong>: Hassle-free returns and exchanges on unworn garments with original tags intact.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* You May Also Like (Related Products) */}
        {related && related.length > 0 && (
          <section className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-16 border-t border-neutral-200">
            <div className="flex justify-between items-baseline mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-normal text-black">
                You May Also Like
              </h2>
              <Link
                href={`/collection/${categoryToSlug(product.category)}`}
                className="text-[11px] font-mono tracking-widest uppercase text-neutral-500 hover:text-black transition-colors underline"
              >
                View Collection →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map(p => (
                <ProductCard
                  key={p._id}
                  id={p.slug}
                  productId={p._id}
                  name={p.name}
                  price={p.price}
                  originalPrice={p.compareAtPrice}
                  badge={badgeFromTags(p.tags)}
                  image={p.images[0]}
                  images={p.images}
                  variants={p.variants}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  )
}

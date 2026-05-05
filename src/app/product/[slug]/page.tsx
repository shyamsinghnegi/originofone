'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useCart } from '@/lib/cartContext'
import { ProductCard, Footer, COLOR_MAP, COLOR_TO_BG } from '@/components/ui'

const STATIC_ACCORDION = [
  {
    title: 'Shipping & Returns',
    content: 'Free standard shipping across Canada on orders over $150. Express options available at checkout. Free returns within 30 days — no questions asked.',
  },
]

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  if (tags.includes('limited')) return 'Limited'
  return undefined
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { addItem, openCart } = useCart()

  const product = useQuery(api.products.getBySlug, { slug: params.slug })
  const allProducts = useQuery(api.products.list, {})

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [openAccordion, setOpenAccordion] = useState<number | null>(0)
  const [added, setAdded] = useState(false)

  // Derive unique colors from variants
  const uniqueColors = useMemo(() => {
    if (!product) return []
    return [...new Set(product.variants.map(v => v.color))]
  }, [product])

  // Derive unique sizes for selected color (or all if no color selected)
  const availableSizes = useMemo(() => {
    if (!product) return []
    const colorVariants = selectedColor
      ? product.variants.filter(v => v.color === selectedColor)
      : product.variants
    return [...new Set(colorVariants.map(v => v.size))]
  }, [product, selectedColor])

  // Which sizes are sold out for the selected color
  const soldOutSizes = useMemo(() => {
    if (!product) return new Set<string>()
    const colorVariants = selectedColor
      ? product.variants.filter(v => v.color === selectedColor)
      : product.variants
    return new Set(colorVariants.filter(v => v.stock === 0).map(v => v.size))
  }, [product, selectedColor])

  // Related products (same category, excluding self)
  const related = useMemo(() => {
    if (!product || !allProducts) return []
    return allProducts
      .filter(p => p.category === product.category && p.slug !== product.slug)
      .slice(0, 4)
  }, [product, allProducts])

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
      image: product.images[0] ?? '',
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); openCart() }, 800)
  }

  // Loading state
  if (product === undefined) {
    return (
      <div className="pt-15 min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  // Not found
  if (product === null) {
    return (
      <div className="pt-15 min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-3xl text-neutral-400">Product not found.</p>
        <Link href="/collection" className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5">Browse Collection →</Link>
      </div>
    )
  }

  const accordion = [
    { title: 'Description', content: product.description },
    ...STATIC_ACCORDION,
  ]

  const images = product.images.length > 0 ? product.images : null
  const firstColor = effectiveColor
  const bgColor = COLOR_TO_BG[firstColor] ?? '#e8e8e8'
  const thumbBgs = images ? images : [bgColor, '#d4d4d4', '#e0e0e0', '#cccccc']

  return (
    <>
      <div className="pt-15">
        {/* Breadcrumb */}
        <div className="px-6 md:px-10 py-3 border-b border-border text-[11px] text-muted">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/collection" className="hover:text-ink transition-colors">{product.category}</Link>
          <span className="mx-2">/</span>
          {product.name}
        </div>

        <div className="grid md:grid-cols-2 min-h-[85vh]">
          {/* Gallery */}
          <div className="border-r border-border">
            <div
              className="aspect-4/5 flex items-end justify-center pb-8 relative"
              style={images ? {} : { background: bgColor }}
            >
              {images ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={images[activeImage]} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="relative" style={{ width: 180, height: 420 }}>
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 rounded-full" style={{ width: 72, height: 72, background: 'rgba(0,0,0,0.15)' }} />
                  <div className="w-full h-full rounded-t-full" style={{ background: 'rgba(0,0,0,0.18)' }} />
                  <div className="absolute rounded" style={{ top: '13%', left: '-38%', right: '-38%', height: '34%', background: 'rgba(0,0,0,0.12)' }} />
                </div>
              )}
              {badgeFromTags(product.tags) && (
                <span className="absolute top-5 left-5 bg-paper text-[9px] tracking-wider uppercase px-2.5 py-1 z-10">
                  {badgeFromTags(product.tags)}
                </span>
              )}
            </div>

            {/* Thumbs */}
            <div className="grid grid-cols-4 border-t border-border">
              {(images ?? thumbBgs).slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square border-r last:border-r-0 border-border relative transition-opacity ${activeImage !== i ? 'opacity-60 hover:opacity-80' : ''}`}
                  style={images ? { background: '#f5f5f5' } : { background: src as string }}
                >
                  {images && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src as string} alt="" className="w-full h-full object-cover" />
                  )}
                  {activeImage === i && <div className="absolute inset-0 border-2 border-ink pointer-events-none" />}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="px-8 md:px-12 py-10 overflow-y-auto">
            <p className="text-[10px] tracking-widest uppercase text-muted mb-3">Origin of One</p>
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] mb-5">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-5 border-b border-border mb-6">
              {product.compareAtPrice && (
                <span className="font-serif text-xl text-neutral-400 line-through">${product.compareAtPrice} CAD</span>
              )}
              <span className="font-serif text-3xl">${product.price} CAD</span>
            </div>

            {/* Colour */}
            {uniqueColors.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between mb-3">
                  <p className="text-[11px] tracking-widest uppercase text-muted">Colour</p>
                  <p className="text-[11px] text-ink">{effectiveColor}</p>
                </div>
                <div className="flex gap-2.5">
                  {uniqueColors.map(c => (
                    <button
                      key={c}
                      onClick={() => { setSelectedColor(c); setSelectedSize('') }}
                      title={c}
                      className={`w-7 h-7 rounded-full border transition-all duration-200 ${
                        effectiveColor === c
                          ? 'outline-2 outline-ink outline-offset-2 border-white'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ background: COLOR_MAP[c] ?? '#ccc' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between mb-3">
                  <p className="text-[11px] tracking-widest uppercase text-muted">Size</p>
                  <p className="text-[11px] text-ink">{effectiveSize}</p>
                </div>
                <div className={`grid gap-1.5 ${availableSizes.length <= 3 ? 'grid-cols-3' : 'grid-cols-5'}`}>
                  {availableSizes.map(s => (
                    <button
                      key={s}
                      onClick={() => !soldOutSizes.has(s) && setSelectedSize(s)}
                      disabled={soldOutSizes.has(s)}
                      className={`py-3 text-[11px] border transition-colors ${
                        soldOutSizes.has(s)
                          ? 'border-border text-gray-300 cursor-not-allowed line-through'
                          : effectiveSize === s
                          ? 'bg-ink text-paper border-ink'
                          : 'border-border text-muted hover:border-ink hover:text-ink'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add */}
            <div className="flex gap-0 mb-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-12 border border-border text-muted hover:border-ink hover:text-ink transition-colors flex items-center justify-center text-lg">−</button>
              <div className="w-14 h-12 border-t border-b border-border flex items-center justify-center text-[13px]">{qty}</div>
              <button onClick={() => setQty(q => q + 1)} className="w-11 h-12 border border-border text-muted hover:border-ink hover:text-ink transition-colors flex items-center justify-center text-lg">+</button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={availableSizes.length > 0 && soldOutSizes.has(effectiveSize)}
              className={`w-full py-4 text-[11px] tracking-widest uppercase transition-all duration-300 mb-2 ${
                added ? 'bg-green-700 text-white' : 'bg-ink text-paper hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {added ? '✓ Added to Bag' : 'Add to Bag'}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 border border-border divide-x divide-border mt-5 mb-6">
              {[['↩', 'Free Returns'], ['🍁', 'Ships Canada'], ['✦', 'Ethically Made']].map(([icon, label]) => (
                <div key={label} className="py-3 text-center">
                  <div className="text-base mb-1">{icon}</div>
                  <p className="text-[9px] tracking-wider uppercase text-muted">{label}</p>
                </div>
              ))}
            </div>

            {/* Accordion */}
            <div className="border-t border-border">
              {accordion.map((item, i) => (
                <div key={i} className="border-b border-border">
                  <button
                    onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                    className="w-full flex justify-between items-center py-4 text-left"
                  >
                    <span className="text-[11px] tracking-widest uppercase text-muted">{item.title}</span>
                    <span className="text-muted text-lg leading-none">{openAccordion === i ? '−' : '+'}</span>
                  </button>
                  <div className={`accordion-content ${openAccordion === i ? 'open' : ''}`}>
                    <p className="text-[13px] text-muted leading-relaxed pb-4">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="px-6 md:px-10 py-16 border-t border-border">
            <div className="flex justify-between items-baseline mb-8">
              <h2 className="font-serif text-3xl md:text-4xl">You May Also Like</h2>
              <Link href="/collection" className="text-[10px] tracking-widest uppercase text-muted hover:text-ink transition-colors link-underline">View All →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => {
                const colors = [...new Set(p.variants.map(v => v.color))]
                const firstC = colors[0]
                return (
                  <ProductCard
                    key={p._id}
                    id={p.slug}
                    name={p.name}
                    price={p.price}
                    originalPrice={p.compareAtPrice}
                    badge={badgeFromTags(p.tags)}
                    colors={colors.map(c => COLOR_MAP[c] ?? '#cccccc')}
                    bg={COLOR_TO_BG[firstC] ?? '#e8e8e8'}
                    image={p.images[0]}
                  />
                )
              })}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  )
}

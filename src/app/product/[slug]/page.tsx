'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cartContext'
import { ProductCard, Footer } from '@/components/ui'

const COLORS = [
  { label: 'Stone Grey', hex: '#8a8278' },
  { label: 'Charcoal',   hex: '#3a3530' },
  { label: 'Camel',      hex: '#c8b89a' },
  { label: 'Black',      hex: '#1a1a18' },
]
const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const SOLD_OUT = ['XL']

const ACCORDION = [
  {
    title: 'Description',
    content: 'The Tundra Wool Overcoat is crafted from 100% premium merino wool, designed to handle the harshest Canadian winters without sacrificing elegance. A clean, minimal silhouette with hidden button placket and structured collar. Length at mid-thigh for coverage without restriction.',
  },
  {
    title: 'Materials & Care',
    content: '100% Merino Wool outer shell. Quilted satin lining. Dry clean recommended. Do not tumble dry. Store folded, not hung.',
  },
  {
    title: 'Shipping & Returns',
    content: 'Free standard shipping across Canada on orders over $150. Express options available at checkout. Free returns within 30 days — no questions asked.',
  },
]

const RELATED = [
  { id: 'nordic-puffer-jacket', name: 'Nordic Puffer Jacket', price: 278, badge: 'Bestseller', bg: '#b8b0a6' },
  { id: 'merino-knit-sweater', name: 'Merino Knit Sweater', price: 168, bg: '#d1cbc4' },
  { id: 'heritage-wool-coat', name: 'Heritage Wool Coat', price: 398, bg: '#afa9a2' },
  { id: 'wool-beanie', name: 'Wool Beanie', price: 58, bg: '#cdc7c0' },
]

const THUMBS = ['#cdc7c0', '#b8b0a6', '#d4cfc9', '#afa9a2']

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { addItem, openCart } = useCart()
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [selectedSize, setSelectedSize] = useState('M')
  const [qty, setQty] = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)
  const [openAccordion, setOpenAccordion] = useState<number | null>(0)
  const [wishlist, setWishlist] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem({
      id: params.slug || 'tundra-wool-overcoat',
      name: 'Tundra Wool Overcoat',
      price: 348,
      size: selectedSize,
      color: selectedColor.label,
      qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="pt-[60px]">
        {/* Breadcrumb */}
        <div className="px-6 md:px-10 py-3 border-b border-border text-[11px] text-muted">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/collection" className="hover:text-ink transition-colors">Outerwear</Link>
          <span className="mx-2">/</span>
          Tundra Wool Overcoat
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-2 min-h-[85vh]">
          {/* GALLERY */}
          <div className="border-r border-border">
            {/* Main image */}
            <div
              className="aspect-[4/5] flex items-end justify-center pb-8 relative"
              style={{ background: THUMBS[activeThumb] }}
            >
              <div className="relative" style={{ width: 180, height: 420 }}>
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 rounded-full" style={{ width: 72, height: 72, background: 'rgba(0,0,0,0.15)' }} />
                <div className="w-full h-full rounded-t-full" style={{ background: 'rgba(0,0,0,0.18)' }} />
                <div className="absolute rounded" style={{ top: '13%', left: '-38%', right: '-38%', height: '34%', background: 'rgba(0,0,0,0.12)' }} />
              </div>
              <span className="absolute top-5 left-5 bg-paper text-[9px] tracking-wider uppercase px-2.5 py-1">New Arrival</span>
            </div>

            {/* Thumbs */}
            <div className="grid grid-cols-4 border-t border-border">
              {THUMBS.map((bg, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`aspect-square border-r last:border-r-0 border-border relative transition-opacity ${activeThumb !== i ? 'opacity-60 hover:opacity-80' : ''}`}
                  style={{ background: bg }}
                >
                  {activeThumb === i && (
                    <div className="absolute inset-0 border-2 border-ink" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* INFO */}
          <div className="px-8 md:px-12 py-10 overflow-y-auto">
            <p className="text-[10px] tracking-widest uppercase text-muted mb-3">Origin of One</p>
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] mb-3">Tundra Wool<br />Overcoat</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="text-gray-400 text-xs">★</span>)}</div>
              <button className="text-[12px] text-muted underline hover:text-ink transition-colors">48 reviews</button>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pb-5 border-b border-border mb-6">
              <span className="font-serif text-3xl">$348 CAD</span>
            </div>

            {/* Colour */}
            <div className="mb-5">
              <div className="flex justify-between mb-3">
                <p className="text-[11px] tracking-widest uppercase text-muted">Colour</p>
                <p className="text-[11px] text-ink">{selectedColor.label}</p>
              </div>
              <div className="flex gap-2.5">
                {COLORS.map(c => (
                  <button
                    key={c.label}
                    onClick={() => setSelectedColor(c)}
                    title={c.label}
                    className={`w-7 h-7 rounded-full border transition-all duration-200 ${
                      selectedColor.label === c.label
                        ? 'outline outline-2 outline-ink outline-offset-2 border-white'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-2">
              <div className="flex justify-between mb-3">
                <p className="text-[11px] tracking-widest uppercase text-muted">Size</p>
                <p className="text-[11px] text-ink">{selectedSize}</p>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => !SOLD_OUT.includes(s) && setSelectedSize(s)}
                    disabled={SOLD_OUT.includes(s)}
                    className={`py-3 text-[11px] border transition-colors ${
                      SOLD_OUT.includes(s)
                        ? 'border-border text-gray-300 cursor-not-allowed line-through'
                        : selectedSize === s
                        ? 'bg-ink text-paper border-ink'
                        : 'border-border text-muted hover:border-ink hover:text-ink'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button className="text-[11px] text-muted underline hover:text-ink transition-colors mb-6">Size Guide →</button>

            {/* Qty + Add */}
            <div className="flex gap-0 mb-3">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-12 border border-border text-muted hover:border-ink hover:text-ink transition-colors flex items-center justify-center text-lg">−</button>
              <div className="w-14 h-12 border-t border-b border-border flex items-center justify-center text-[13px]">{qty}</div>
              <button onClick={() => setQty(q => q + 1)} className="w-11 h-12 border border-border text-muted hover:border-ink hover:text-ink transition-colors flex items-center justify-center text-lg">+</button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`w-full py-4 text-[11px] tracking-widest uppercase transition-all duration-300 mb-2 ${
                added ? 'bg-green-700 text-white' : 'bg-ink text-paper hover:bg-gray-900'
              }`}
            >
              {added ? '✓ Added to Bag' : 'Add to Bag'}
            </button>
            <button
              onClick={() => setWishlist(!wishlist)}
              className="w-full py-3.5 border border-border text-[11px] tracking-widest uppercase text-muted hover:border-ink hover:text-ink transition-colors"
            >
              {wishlist ? '♥ Saved' : '♡ Save to Wishlist'}
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
              {ACCORDION.map((item, i) => (
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
        <section className="px-6 md:px-10 py-16 border-t border-border">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-serif text-3xl md:text-4xl">You May Also Like</h2>
            <Link href="/collection" className="text-[10px] tracking-widest uppercase text-muted hover:text-ink transition-colors link-underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {RELATED.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

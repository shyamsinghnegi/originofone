// ── Button ──────────────────────────────────────────────
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuickAdd } from '@/lib/quickAddContext'


interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Btn({ variant = 'dark', size = 'md', children, className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center tracking-widest uppercase font-sans font-light transition-all duration-200 cursor-pointer'
  const sizes = { sm: 'px-5 py-2.5 text-[11px]', md: 'px-7 py-3.5 text-[11px]', lg: 'px-10 py-4 text-[11px]' }
  const variants = {
    dark:    'bg-black text-white hover:bg-neutral-900',
    outline: 'border border-black text-black hover:bg-black hover:text-white',
    ghost:   'border border-neutral-200 text-neutral-500 hover:border-black hover:text-black',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Section title ────────────────────────────────────────
export function SectionTitle({ eyebrow, title, className = '' }: { eyebrow?: string; title: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <p className="text-[11px] tracking-widest uppercase text-neutral-500 mb-3">{eyebrow}</p>}
      <h2 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05]">{title}</h2>
    </div>
  )
}

// ── Marquee strip ────────────────────────────────────────
export function MarqueeStrip({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="border-y border-neutral-200 overflow-hidden py-3 bg-white">
      <div className="animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="text-[11px] tracking-widest uppercase text-neutral-400 mx-8">{item}</span>
        ))}
      </div>
    </div>
  )
}

// ── Colour helpers (exported for pages) ─────────────────
// The first 5 are the brand's signature palette (from the Origin of One
// moodboard — "washed"/"lived-in" earth tones, not synthetic saturated
// colors). Everything after is a broader generic palette kept available for
// products outside the core line. Card backgrounds (COLOR_TO_BG) are a
// separate, bolder palette — graphic panel colors, not muted tints.
export const BRAND_COLORS = ['Charcoal Black', 'Off-White / Bone', 'Concrete Grey', 'Dry Olive', 'Washed Sand']

export const COLOR_MAP: Record<string, string> = {
  'Charcoal Black': '#2a2a28',
  'Off-White / Bone': '#e8e3d8',
  'Concrete Grey': '#9b9a94',
  'Dry Olive': '#6b6a54',
  'Washed Sand': '#d6cebe',

  'Black': '#0a0a0a',
  'Charcoal': '#3d3d3d',
  'Stone Grey': '#8a8278',
  'Light Grey': '#d4d4d4',
  'Dark Grey': '#525252',
  'Camel': '#c8b89a',
  'White': '#f5f5f4',
  'Cream': '#f0ebe3',
  'Ivory': '#ede8df',
  'Navy': '#1a2745',
  'Forest': '#2d4a3e',
  'Burgundy': '#6b2737',
  'Taupe': '#b5a898',
  'Sand': '#d4c4a8',
  'Smoke': '#737373',
  'Tan': '#c4a882',
}

// Complementary/contrasting panel colors — chosen to make the garment pop
// against its card background (color-wheel opposites or high-contrast
// neutrals), not a tinted shade of the garment's own color. Bright/light
// shades, not deep saturated blocks — closer to a pastel backdrop.
export const COLOR_TO_BG: Record<string, string> = {
  'Charcoal Black': '#f0c4a8',   // near-black garment → warm peach pop
  'Off-White / Bone': '#b8d4ec', // warm neutral garment → light sky blue
  'Concrete Grey': '#e8c9a0',    // cool grey → warm sand
  'Dry Olive': '#e0b8d4',        // olive (yellow-green) → light orchid
  'Washed Sand': '#a8d4dc',      // warm sand → light teal

  'Black': '#f4b8a0',            // black garment → light terracotta
  'Charcoal': '#f0cc94',         // dark neutral → light amber
  'Stone Grey': '#dcb8d0',       // cool-warm grey → light plum
  'Light Grey': '#b8c0e8',       // light neutral → light periwinkle
  'Dark Grey': '#f0bca0',        // dark neutral → light rust
  'Camel': '#a8d8e0',            // warm tan → light teal
  'White': '#a8c4f0',            // white garment → bright light blue
  'Cream': '#b0c0ec',            // warm cream → light powder blue
  'Ivory': '#b8ccec',            // warm ivory → light slate-blue
  'Navy': '#f0cc94',             // blue garment → light amber (true complement)
  'Forest': '#f0b8cc',           // green garment → light pink (true complement)
  'Burgundy': '#a8e0cc',         // red garment → light mint (true complement)
  'Taupe': '#a8ccec',            // warm taupe → light blue
  'Sand': '#b0c8ec',             // warm sand → light blue
  'Smoke': '#ecc8a0',            // neutral grey → light tan
  'Tan': '#a8c0e0',              // warm tan → light periwinkle
}

// ── Studio backdrops ─────────────────────────────────────
// Two fixed photography-style backdrops used behind products with no real
// photo yet, instead of a computed per-garment tint — a flat color block
// reads worse than a consistent studio look, same idea as a real shoot
// reusing the same backdrop across a whole product line.
const STUDIO_BACKDROPS = [
  // Deep teal-blue spotlight studio — dark, needs a light figure tint
  { bg: 'radial-gradient(ellipse 140% 90% at 50% 105%, #2a6b78 0%, #163f4d 45%, #0d2530 100%)', figureTint: 'rgba(255,255,255,0.3)' },
  // Soft cloudy sky-blue studio — light, needs a dark figure tint
  { bg: 'linear-gradient(160deg, #cfe0ea 0%, #a9c7d8 50%, #8fb4c9 100%)', figureTint: 'rgba(0,0,0,0.18)' },
]

function studioBackdropFor(seed: string): typeof STUDIO_BACKDROPS[number] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0
  return STUDIO_BACKDROPS[Math.abs(hash) % STUDIO_BACKDROPS.length]
}

// ── Product card ─────────────────────────────────────────
interface ProductCardProps {
  id: string
  productId?: string
  name: string
  price: number
  originalPrice?: number
  badge?: string
  slides?: string[]
  image?: string
  variants?: { color: string; size: string; stock: number }[]
}

// Placeholder figure rendered inside each slide
function PlaceholderFigure({ tint }: { tint: string }) {
  return (
    <div className="absolute inset-0 flex items-end justify-center pb-6">
      <div className="relative" style={{ width: 64, height: 160 }}>
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full" style={{ background: tint }} />
        <div className="w-full h-full rounded-t-full" style={{ background: tint }} />
        <div className="absolute top-[18%] -left-7 -right-7 h-[38%] rounded" style={{ background: tint, opacity: 0.7 }} />
      </div>
    </div>
  )
}

export function ProductCard({ id, productId, name, price, originalPrice, badge, slides, image, variants }: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [hovered,  setHovered]  = useState(false)
  const quickAdd = useQuickAdd()

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!productId || !variants || variants.length === 0) return
    quickAdd.open({ productId, slug: id, name, price, originalPrice, image, variants })
  }

  const slideBgs: string[] = slides ?? []
  const total = image ? 1 : Math.max(slideBgs.length, 1)

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex(i => (i - 1 + total) % total)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex(i => (i + 1) % total)
  }

  const studio = studioBackdropFor(id)
  const currentBg = slideBgs[imgIndex] ?? studio.bg
  const figureTint = studio.figureTint

  return (
    <Link href={`/product/${id}`} className="group block">
      {/* ── Card image area ── */}
      <div
        className="aspect-3/4 relative overflow-hidden rounded-xl mb-2 transition-colors duration-500"
        style={{ background: currentBg }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <PlaceholderFigure tint={figureTint} />
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-white text-black text-[10px] tracking-wider uppercase px-2 py-1 z-10">
            {badge}
          </span>
        )}

        {/* ── Slide indicators (dots) ── */}
        {total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slideBgs.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-200 ${
                  i === imgIndex ? 'w-3 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-black/30'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Prev arrow ── */}
        {total > 1 && (
          <button
            onClick={prev}
            aria-label="Previous image"
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 flex items-center justify-center transition-all duration-200 ${
              hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* ── Next arrow ── */}
        {total > 1 && (
          <button
            onClick={next}
            aria-label="Next image"
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/90 flex items-center justify-center transition-all duration-200 ${
              hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

      </div>

      {/* ── Card text ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] text-black truncate">{name}</p>
          <div className="flex items-center gap-2">
            {originalPrice && <span className="text-[12px] text-neutral-400 line-through">${originalPrice}</span>}
            <span className="text-[12px] text-neutral-500">${price} CAD</span>
          </div>
        </div>
        {productId && variants && variants.length > 0 && (
          <button
            onClick={handleQuickAdd}
            aria-label={`Quick add ${name}`}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-black transition-colors text-lg leading-none"
          >
            +
          </button>
        )}
      </div>
    </Link>
  )
}

// ── Footer ───────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-10 py-12">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-base tracking-[0.2em] uppercase mb-3 text-black">Origin of One</p>
          <p className="text-[12px] text-neutral-500 leading-relaxed max-w-[200px]">
            Premium winter clothing for Canadians. Made with care. Built to last.
          </p>
        </div>
        <div>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500 mb-4 font-medium">Shop</p>
          {[
            ['New Arrivals', '/new-in'],
            ['Outerwear', '/collection/outerwear'],
            ['Knitwear', '/collection/knitwear'],
            ['Accessories', '/collection/accessories'],
            ['Sale', '/collection/all'],
          ].map(([label, href]) => (
            <a key={label} href={href} className="block text-[12px] text-neutral-500 hover:text-black transition-colors mb-2 link-underline">{label}</a>
          ))}
        </div>
        <div>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500 mb-4 font-medium">Help</p>
          {[
            ['Sizing Guide', '/sizing-guide'],
            ['Shipping Info', '/shipping-returns'],
            ['Returns', '/shipping-returns'],
            ['FAQ', '/faq'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <a key={label} href={href} className="block text-[12px] text-neutral-500 hover:text-black transition-colors mb-2 link-underline">{label}</a>
          ))}
        </div>
        <div>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500 mb-4 font-medium">Company</p>
          {['Our Story', 'Sustainability', 'Careers', 'Press'].map(l => (
            <a key={l} href="/about" className="block text-[12px] text-neutral-500 hover:text-black transition-colors mb-2 link-underline">{l}</a>
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-200 px-6 md:px-10 py-4 flex justify-between items-center">
        <span className="text-[11px] text-neutral-400">© 2025 Origin of One. Canada.</span>
        <span className="text-[11px] text-neutral-400 flex gap-3">
          <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-black transition-colors">Terms</a>
        </span>
      </div>
    </footer>
  )
}
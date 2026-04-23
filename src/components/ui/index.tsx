// ── Button ──────────────────────────────────────────────
'use client'
import { useState } from 'react'
import Link from 'next/link'


interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Btn({ variant = 'dark', size = 'md', children, className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center tracking-widest uppercase font-sans font-light transition-all duration-200 cursor-pointer'
  const sizes = { sm: 'px-5 py-2.5 text-[10px]', md: 'px-7 py-3.5 text-[10px]', lg: 'px-10 py-4 text-[11px]' }
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
      {eyebrow && <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-3">{eyebrow}</p>}
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
          <span key={i} className="text-[10px] tracking-widest uppercase text-neutral-400 mx-8">{item}</span>
        ))}
      </div>
    </div>
  )
}

// ── Product card ─────────────────────────────────────────
// Each "image" is a placeholder slide. On hover, left/right arrows appear
// to cycle between them. The background colour shifts per slide for variety.

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  badge?: string
  colors?: string[]
  // bg is now the BASE colour for slide 0; subsequent slides use
  // slightly lighter/darker variants automatically
  bg?: string
  // Optional array of per-slide background colours (overrides auto)
  slides?: string[]
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

export function ProductCard({ id, name, price, originalPrice, badge, colors, bg = '#e8e8e8', slides }: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [hovered,  setHovered]  = useState(false)

  // Build slide bg list — use provided or generate 3 variants from base
  const slideBgs: string[] = slides ?? [bg, lighten(bg, 12), darken(bg, 10)]
  const total = slideBgs.length

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex(i => (i - 1 + total) % total)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    setImgIndex(i => (i + 1) % total)
  }

  const currentBg = slideBgs[imgIndex]
  const figureTint = 'rgba(0,0,0,0.16)'

  return (
    <Link href={`/product/${id}`} className="group block">
      {/* ── Card image area ── */}
      <div
        className="aspect-[3/4] relative overflow-hidden mb-3 transition-colors duration-500"
        style={{ background: currentBg }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Placeholder figure */}
        <PlaceholderFigure tint={figureTint} />

        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-white text-black text-[9px] tracking-wider uppercase px-2 py-1 z-10">
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

        {/* ── Quick add ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-black text-white text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
          Quick Add +
        </div>
      </div>

      {/* ── Card text ── */}
      <div>
        <p className="text-[13px] mb-1 text-black">{name}</p>
        <div className="flex items-center gap-2">
          {originalPrice && <span className="text-[12px] text-neutral-400 line-through">${originalPrice}</span>}
          <span className="text-[12px] text-neutral-500">${price} CAD</span>
        </div>
        {colors && (
          <div className="flex gap-1.5 mt-2">
            {colors.map((c, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-full border border-neutral-300" style={{ background: c }} />
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

// ── Colour helpers ───────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, Math.round(v))).toString(16).padStart(2, '0')).join('')
}
function lighten(hex: string, amt: number): string {
  if (!hex.startsWith('#')) return hex
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r + amt, g + amt, b + amt)
}
function darken(hex: string, amt: number): string {
  if (!hex.startsWith('#')) return hex
  const [r, g, b] = hexToRgb(hex)
  return rgbToHex(r - amt, g - amt, b - amt)
}

// ── Footer ───────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-24 bg-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-10 py-12">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-base tracking-[0.2em] uppercase mb-3 text-black">Origin of One</p>
          <p className="text-[12px] text-neutral-500 leading-relaxed max-w-[200px]">
            Premium winter clothing for Canadians. Made with care. Built to last.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] tracking-widest uppercase text-neutral-400 mb-4">Shop</h4>
          {['New Arrivals', 'Outerwear', 'Knitwear', 'Accessories', 'Sale'].map(l => (
            <a key={l} href="/collection" className="block text-[12px] text-neutral-500 hover:text-black transition-colors mb-2 link-underline">{l}</a>
          ))}
        </div>
        <div>
          <h4 className="text-[10px] tracking-widest uppercase text-neutral-400 mb-4">Help</h4>
          {['Sizing Guide', 'Shipping Info', 'Returns', 'FAQ', 'Contact'].map(l => (
            <a key={l} href="#" className="block text-[12px] text-neutral-500 hover:text-black transition-colors mb-2 link-underline">{l}</a>
          ))}
        </div>
        <div>
          <h4 className="text-[10px] tracking-widest uppercase text-neutral-400 mb-4">Company</h4>
          {['Our Story', 'Sustainability', 'Careers', 'Press'].map(l => (
            <a key={l} href="/about" className="block text-[12px] text-neutral-500 hover:text-black transition-colors mb-2 link-underline">{l}</a>
          ))}
        </div>
      </div>
      <div className="border-t border-neutral-200 px-6 md:px-10 py-4 flex justify-between items-center">
        <span className="text-[11px] text-neutral-400">© 2025 Origin of One. Canada.</span>
        <span className="text-[11px] text-neutral-400">Privacy · Terms</span>
      </div>
    </footer>
  )
}
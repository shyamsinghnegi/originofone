// ── Button ──────────────────────────────────────────────
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuickAdd } from '@/lib/quickAddContext'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Id } from '@/../convex/_generated/dataModel'


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

// Greyscale panel colors (black/grey/white) — a neutral backdrop family
// instead of a garment-matched or complementary color.
export const COLOR_TO_BG: Record<string, string> = {
  'Charcoal Black': '#e0e0e0',
  'Off-White / Bone': '#d4d4d4',
  'Concrete Grey': '#ececec',
  'Dry Olive': '#c8c8c8',
  'Washed Sand': '#dcdcdc',

  'Black': '#e8e8e8',
  'Charcoal': '#d0d0d0',
  'Stone Grey': '#e4e4e4',
  'Light Grey': '#cccccc',
  'Dark Grey': '#e0e0e0',
  'Camel': '#d8d8d8',
  'White': '#c4c4c4',
  'Cream': '#d4d4d4',
  'Ivory': '#dcdcdc',
  'Navy': '#e8e8e8',
  'Forest': '#d0d0d0',
  'Burgundy': '#e4e4e4',
  'Taupe': '#d8d8d8',
  'Sand': '#dcdcdc',
  'Smoke': '#c8c8c8',
  'Tan': '#e0e0e0',
}

// ── Studio backdrops ─────────────────────────────────────
// Two fixed photography-style backdrops used behind products with no real
// photo yet, instead of a computed per-garment tint — a flat color block
// reads worse than a consistent studio look, same idea as a real shoot
// reusing the same backdrop across a whole product line.
const STUDIO_BACKDROPS = [
  // Dark charcoal spotlight studio — dark, needs a light figure tint
  { bg: 'radial-gradient(ellipse 140% 90% at 50% 105%, #4a4a4a 0%, #262626 45%, #131313 100%)', figureTint: 'rgba(255,255,255,0.3)' },
  // Soft light grey studio — light, needs a dark figure tint
  { bg: 'linear-gradient(160deg, #f2f2f2 0%, #dcdcdc 50%, #c4c4c4 100%)', figureTint: 'rgba(0,0,0,0.18)' },
]

export function studioBackdropFor(seed: string): typeof STUDIO_BACKDROPS[number] {
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
  images?: string[]
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

export function ProductCard({ id, productId, name, price, originalPrice, badge, slides, image, images, variants }: ProductCardProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [hovered,  setHovered]  = useState(false)
  const quickAdd = useQuickAdd()
  const router = useRouter()
  const { user } = useUser()

  const wishlist = useQuery(api.wishlist.listMine, user ? undefined : "skip")
  const toggleWishlist = useMutation(api.wishlist.toggle)

  const isWishlisted = wishlist?.some(w => w.product?._id === productId) ?? false

  const cardImages: string[] = images && images.length > 0 ? images : image ? [image] : []
  const total = cardImages.length
  const currentImage = cardImages[imgIndex] ?? cardImages[0]

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!productId || !variants || variants.length === 0) return
    quickAdd.open({ productId, slug: id, name, price, originalPrice, image: currentImage, variants })
  }

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      router.push('/sign-in')
      return
    }
    if (productId) {
      toggleWishlist({ productId: productId as Id<"products"> })
    }
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImgIndex(i => (i - 1 + total) % total)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setImgIndex(i => (i + 1) % total)
  }

  const studio = studioBackdropFor(id)
  const figureTint = studio.figureTint

  return (
    <Link href={`/product/${id}`} className="group block">
      {/* ── Card image area ── */}
      <div
        className="aspect-3/4 relative overflow-hidden rounded-xl mb-2 transition-colors duration-500 bg-neutral-100"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {currentImage ? (
          <Image
            src={currentImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            priority={imgIndex === 0}
          />
        ) : (
          <PlaceholderFigure tint={figureTint} />
        )}

        {/* Badge */}
        {badge && (
          <span className="absolute top-3 left-3 bg-white text-black text-[10px] tracking-wider uppercase px-2 py-1 z-10">
            {badge}
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-colors ${
            isWishlisted ? 'text-red-500 animate-like' : 'text-black/40 hover:text-black/80'
          }`}
        >
          {isWishlisted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>

        {/* ── Slide indicators (dots) ── */}
        {total > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-none">
            {cardImages.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === imgIndex ? 'w-3.5 h-1 bg-white shadow-xs' : 'w-1 h-1 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Prev arrow ── */}
        {total > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/85 hover:bg-white text-black shadow-md flex items-center justify-center transition-all duration-200 opacity-90 md:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 backdrop-blur-xs"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* ── Next arrow ── */}
        {total > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/85 hover:bg-white text-black shadow-md flex items-center justify-center transition-all duration-200 opacity-90 md:opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 backdrop-blur-xs"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

      </div>

      {/* ── Card text ── */}
      <div className="flex items-start justify-between gap-2 mt-2">
        <div className="min-w-0">
          <p className="text-[11px] md:text-[12px] text-black line-clamp-2 font-medium">{name}</p>
          <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
            {originalPrice && <span className="text-[10px] md:text-[11px] text-neutral-400 line-through">${originalPrice}</span>}
            <span className="text-[10px] md:text-[11px] text-neutral-500">${price} CAD</span>
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
      <div className="px-6 md:px-10 py-12">
        <div className="mb-10 md:mb-0 md:hidden">
          <p className="font-serif text-base tracking-[0.2em] uppercase mb-3 text-black">Origin of One</p>
          <p className="text-[12px] text-neutral-500 leading-relaxed max-w-70">
            Premium winter clothing for Canadians. Made with care. Built to last.
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-8">
          <div className="hidden md:block">
            <p className="font-serif text-base tracking-[0.2em] uppercase mb-3 text-black">Origin of One</p>
            <p className="text-[12px] text-neutral-500 leading-relaxed max-w-50">
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
      </div>
      <div className="border-t border-neutral-200 px-6 md:px-10 py-4 flex justify-between items-center">
        <span className="text-[11px] text-neutral-400">© {new Date().getFullYear()} Origin of One. Canada.</span>
        <span className="text-[11px] text-neutral-400 flex gap-3">
          <a href="/privacy" className="hover:text-black transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-black transition-colors">Terms</a>
        </span>
      </div>
    </footer>
  )
}
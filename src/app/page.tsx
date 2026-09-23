'use client'

import Link from 'next/link'
import { MarqueeStrip, Footer } from '@/components/ui'
import { HomeProductSection } from '@/components/HomeProductSection'
import { HeroLogoLandedProvider, StickyHeroLogo, useLogoLanded } from '@/components/layout/StickyHeroLogo'

const CATEGORIES = [
  { num: '01', label: 'Outerwear',   count: '24 styles' },
  { num: '02', label: 'Knitwear',    count: '18 styles' },
  { num: '03', label: 'Layering',    count: '12 styles' },
  { num: '04', label: 'Accessories', count: '30 styles' },
]

const HERO_SLIDES = [
  {
    bg: '#0a0a0a',
    eyebrow: 'Est. Canada · Winter 2025',
    label: 'SHOP COLLECTION',
    href: '/collection/all',
    image: 'https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/hero/hero-slide-1.jpg',
    mobileImage: 'https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/hero/hero-mobile-1.jpg',
  },
  {
    bg: '#111111',
    eyebrow: 'New Arrivals · Just Landed',
    label: 'NEW IN',
    href: '/new-in',
    image: 'https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/hero/hero-slide-2.jpg',
    mobileImage: 'https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/products/tundra-wool-overcoat-1.jpg',
  },
  {
    bg: '#141414',
    eyebrow: 'Winter Campaign · Lookbook',
    label: 'EXPLORE ALL',
    href: '/collection/all',
    image: 'https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/hero/hero-slide-3.jpg',
    mobileImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1080&q=85',
  },
]

const NAV_H  = 60
const SLIDES = HERO_SLIDES.length

type SlideContent = {
  bg?: string
  eyebrow: string
  label: string
  href: string
  image?: string
  mobileImage?: string
  figure?: string
}

function SlideInner({ content, index, total, isFirst, isRightSplit, isLastSlide }: {
  content: SlideContent
  index?: number
  total?: number
  isFirst?: boolean
  isRightSplit?: boolean
  isLastSlide?: boolean
}) {
  const logoLanded = useLogoLanded()
  const hideForLogo = isLastSlide && logoLanded

  return (
    <>
      {/* Editorial Hero Background Image */}
      {content.image && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <picture>
            {content.mobileImage && (
              <source media="(max-width: 768px)" srcSet={content.mobileImage} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.image}
              alt={content.label}
              className="w-full h-full object-cover object-center brightness-90 scale-100"
            />
          </picture>
          {/* Dark cinematic vignette matching About page for seamless slide transitions */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        </div>
      )}

      <p style={{ position: 'absolute', top: 16 + NAV_H, left: 24, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', zIndex: 2 }}>
        {content.eyebrow}
      </p>

      <div
        style={{
          position: 'absolute', bottom: 40, right: 24, zIndex: 2,
          opacity: hideForLogo ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: hideForLogo ? 'none' : 'auto',
        }}
      >
        <Link href={content.href} style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2 }}>
          {content.label} →
        </Link>
      </div>

      {!isRightSplit && index !== undefined && (
        <p
          style={{
            position: 'absolute', bottom: 40, left: 24, fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', zIndex: 2,
            opacity: hideForLogo ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </p>
      )}

      {isFirst && (
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2 }}>
          <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
          <p style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Scroll</p>
        </div>
      )}
    </>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroLogoLandedProvider heroGridId="hero-grid">
      <div id="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', position: 'relative', zIndex: 10 }}>

        {/* Slides */}
        <div style={{ gridColumn: 1, gridRow: 1, zIndex: 10 }}>
          {HERO_SLIDES.map((slide: any, i) => {
            const isLastSlide = i === HERO_SLIDES.length - 1
            if (slide.isSplit) {
              return (
                <div key={i} className="flex flex-col md:flex-row" style={{ height: '100vh' }}>
                  <div className="relative flex-1 h-full border-b md:border-b-0 md:border-r border-white/10" style={{ background: slide.left.bg }}>
                    <SlideInner content={slide.left} index={i} total={SLIDES} isLastSlide={isLastSlide} />
                  </div>
                  <div className="relative flex-1 h-full" style={{ background: slide.right.bg }}>
                    <SlideInner content={slide.right} isRightSplit isLastSlide={isLastSlide} />
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="relative" style={{ height: '100vh', background: slide.bg }}>
                <SlideInner content={slide} index={i} total={SLIDES} isFirst={i === 0} isLastSlide={isLastSlide} />
              </div>
            )
          })}
        </div>

        <StickyHeroLogo />
      </div>
      </HeroLogoLandedProvider>

      {/* Rest of page */}
      <div className="relative z-30 bg-paper">
        <MarqueeStrip items={['Free Returns','·','Ethically Sourced','·','Ships Across Canada','·','Premium Materials','·','Winter Ready','·','Made to Last']} />

        <section className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.label} href={`/collection/${cat.label.toLowerCase()}`} className={`group px-6 md:px-8 py-10 hover:bg-neutral-50 transition-colors duration-200 relative ${i < 3 ? 'border-r border-neutral-200' : ''}`}>
              <p className="font-serif text-5xl text-neutral-400 leading-none mb-4 group-hover:text-neutral-500 transition-colors">{cat.num}</p>
              <p className="text-[11px] tracking-widest uppercase text-neutral-500 mb-1">{cat.label}</p>
              <p className="text-[12px] text-neutral-400">{cat.count}</p>
              <span className="absolute bottom-6 right-6 text-neutral-400 group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200 text-sm">↗</span>
            </Link>
          ))}
        </section>

        <HomeProductSection
          eyebrow="Just Landed"
          title="New Arrivals"
          viewAllHref="/new-in"
          filter={p => p.tags.includes('new') || p.tags.includes('new-in')}
        />
        <HomeProductSection
          eyebrow="Cold-Weather Essentials"
          title="Outerwear"
          viewAllHref="/collection/outerwear"
          filter={p => p.category === 'Outerwear'}
        />
        <HomeProductSection
          eyebrow="Finishing Touches"
          title="Accessories"
          viewAllHref="/collection/accessories"
          filter={p => p.category === 'Accessories'}
        />
        <HomeProductSection
          eyebrow="Layer Up"
          title="Knitwear & Layering"
          viewAllHref="/collection/knitwear"
          filter={p => p.category === 'Knitwear' || p.category === 'Layering'}
        />

        <section className="grid md:grid-cols-2 border-t border-neutral-200">
          <div className="relative min-h-[60vh] md:min-h-[80vh] overflow-hidden bg-neutral-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/philosophy.jpg"
              alt="Origin of One Philosophy - Master Atelier"
              className="w-full h-full object-cover object-center brightness-95"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col justify-center px-8 md:px-14 py-16 border-l border-neutral-200">
            <p className="text-[11px] tracking-widest uppercase text-neutral-500 mb-6">Our philosophy</p>
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] mb-8 text-black">One piece.<br /><em>One story.</em></h2>
            <p className="text-[14px] text-neutral-500 leading-relaxed mb-4 max-w-[380px]">Every garment from OriginofOne is made with intention — no excess, no waste. Premium Canadian winter clothing that earns its place in your wardrobe for years, not seasons.</p>
            <p className="text-[14px] text-neutral-500 leading-relaxed mb-8 max-w-[380px]">We believe in buying less and wearing more.</p>
            <Link href="/about" className="self-start border-b border-black text-[11px] tracking-widest uppercase pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors duration-200">Our Story →</Link>
          </div>
        </section>

        <section className="py-24 px-6 text-center border-t border-neutral-200 border-b">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => <span key={i} className="text-neutral-400 text-sm">★</span>)}
          </div>
          <blockquote className="font-serif text-2xl md:text-4xl lg:text-5xl italic leading-[1.2] max-w-2xl mx-auto mb-6 text-black">"The only coat I've needed for three Canadian winters."</blockquote>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500">— Verified Customer, Toronto ON</p>
        </section>

        <section className="bg-black text-white py-20 px-6 md:px-10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[11px] tracking-widest uppercase text-white/40 mb-4">Stay in the loop</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Early access.<br /><em>No noise.</em></h2>
            <p className="text-[13px] text-white/50 mb-8">New arrivals, exclusive offers, and the occasional story about making things that last.</p>
            <div className="flex max-w-md mx-auto">
              <input type="email" placeholder="Your email address" className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-[12px] outline-none placeholder:text-white/30 text-white focus:border-white/50 transition-colors" />
              <button className="bg-white text-black text-[11px] tracking-widest uppercase px-6 py-3 hover:bg-neutral-100 transition-colors whitespace-nowrap">Subscribe</button>
            </div>
            <p className="text-[11px] text-white/30 mt-3">No spam. Unsubscribe anytime.</p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}

export const runtime = 'edge'


import Link from 'next/link'
import { MarqueeStrip, Footer } from '@/components/ui'
import { HomeNewArrivals } from '@/components/HomeNewArrivals'

const CATEGORIES = [
  { num: '01', label: 'Outerwear',   count: '24 styles' },
  { num: '02', label: 'Knitwear',    count: '18 styles' },
  { num: '03', label: 'Layering',    count: '12 styles' },
  { num: '04', label: 'Accessories', count: '30 styles' },
]

const HERO_SLIDES = [
  { bg: '#0a0a0a', eyebrow: 'Est. Canada · Winter 2025',  label: 'SHOP COLLECTION', href: '/collection', figure: 'rgba(255,255,255,0.07)' },
  { bg: '#111111', eyebrow: 'New Arrivals · Just Landed', label: 'NEW IN',           href: '/new-in',     figure: 'rgba(255,255,255,0.06)' },
  {
    isSplit: true,
    left:  { bg: '#1a1a1a', eyebrow: 'Womenswear', label: 'SHOP WOMEN', href: '/collection', figure: 'rgba(255,255,255,0.08)' },
    right: { bg: '#222222', eyebrow: 'Menswear',   label: 'SHOP MEN',   href: '/collection', figure: 'rgba(255,255,255,0.05)' },
  },
]

const NAV_H  = 60
const SLIDES = HERO_SLIDES.length

type SlideContent = { bg?: string; eyebrow: string; label: string; href: string; figure: string }

function SlideInner({ content, index, total, isFirst, isRightSplit }: {
  content: SlideContent
  index?: number
  total?: number
  isFirst?: boolean
  isRightSplit?: boolean
}) {
  return (
    <>
      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage:
          'repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(255,255,255,1) 79px,rgba(255,255,255,1) 80px),' +
          'repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(255,255,255,1) 79px,rgba(255,255,255,1) 80px)',
      }} />

      {/* Placeholder figure */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 180, height: '52%', marginBottom: 32 }}>
          <div style={{ position: 'absolute', top: -56, left: '50%', transform: 'translateX(-50%)', width: 68, height: 68, borderRadius: '50%', background: content.figure }} />
          <div style={{ width: '100%', height: '100%', borderRadius: '90px 90px 0 0', background: content.figure }} />
          <div style={{ position: 'absolute', top: '16%', left: '-44%', right: '-44%', height: '34%', borderRadius: 4, background: content.figure, opacity: 0.8 }} />
        </div>
      </div>

      <p style={{ position: 'absolute', top: 16 + NAV_H, left: 24, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', zIndex: 2 }}>
        {content.eyebrow}
      </p>

      <div style={{ position: 'absolute', bottom: 40, right: 24, zIndex: 2 }}>
        <Link href={content.href} style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 2 }}>
          {content.label} →
        </Link>
      </div>

      {!isRightSplit && index !== undefined && (
        <p style={{ position: 'absolute', bottom: 40, left: 24, fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', zIndex: 2 }}>
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
      <div id="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', position: 'relative', zIndex: 10 }}>

        {/* Slides */}
        <div style={{ gridColumn: 1, gridRow: 1, zIndex: 10 }}>
          {HERO_SLIDES.map((slide: any, i) => {
            if (slide.isSplit) {
              return (
                <div key={i} className="flex flex-col md:flex-row" style={{ height: '100vh' }}>
                  <div className="relative flex-1 h-full border-b md:border-b-0 md:border-r border-white/10" style={{ background: slide.left.bg }}>
                    <SlideInner content={slide.left} index={i} total={SLIDES} />
                  </div>
                  <div className="relative flex-1 h-full" style={{ background: slide.right.bg }}>
                    <SlideInner content={slide.right} isRightSplit />
                  </div>
                </div>
              )
            }
            return (
              <div key={i} className="relative" style={{ height: '100vh', background: slide.bg }}>
                <SlideInner content={slide} index={i} total={SLIDES} isFirst={i === 0} />
              </div>
            )
          })}
        </div>

        {/* Sticky centred logo */}
        <div style={{ gridColumn: 1, gridRow: 1, zIndex: 20, pointerEvents: 'none' }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
            <h1
              className="font-serif text-white text-center leading-[0.88] tracking-tight select-none mix-blend-difference"
              style={{
                position: 'absolute',
                left: 0, right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 'clamp(2.5rem, 8vw, 8rem)',
                whiteSpace: 'nowrap',
                padding: '0 1rem',
              }}
            >
              ORIGIN OF ONE
            </h1>
          </div>
        </div>
      </div>

      {/* Rest of page */}
      <div className="relative z-30 bg-paper">
        <MarqueeStrip items={['Free Returns','·','Ethically Sourced','·','Ships Across Canada','·','Premium Materials','·','Winter Ready','·','Made to Last']} />

        <section className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.label} href="/collection" className={`group px-6 md:px-8 py-10 hover:bg-neutral-50 transition-colors duration-200 relative ${i < 3 ? 'border-r border-neutral-200' : ''}`}>
              <p className="font-serif text-5xl text-neutral-400 leading-none mb-4 group-hover:text-neutral-500 transition-colors">{cat.num}</p>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-1">{cat.label}</p>
              <p className="text-[12px] text-neutral-400">{cat.count}</p>
              <span className="absolute bottom-6 right-6 text-neutral-400 group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200 text-sm">↗</span>
            </Link>
          ))}
        </section>

        <section className="px-6 md:px-10 py-20">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-2">Just Landed</p>
              <h2 className="font-serif text-4xl md:text-5xl text-black">New Arrivals</h2>
            </div>
            <Link href="/collection" className="text-[10px] tracking-widest uppercase text-neutral-500 hover:text-black transition-colors link-underline">View All →</Link>
          </div>
          <HomeNewArrivals />
        </section>

        <section className="grid md:grid-cols-2 border-t border-neutral-200">
          <div className="min-h-[60vh] md:min-h-[80vh] flex items-end justify-center pb-10" style={{ background: '#000' }}>
            <div className="relative" style={{ width: 160, height: 380 }}>
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full w-16 h-16" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="w-full h-full rounded-t-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="absolute rounded" style={{ top: '13%', left: '-40%', right: '-40%', height: '32%', background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
          <div className="flex flex-col justify-center px-8 md:px-14 py-16 border-l border-neutral-200">
            <p className="text-[10px] tracking-widest uppercase text-neutral-500 mb-6">Our philosophy</p>
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
          <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl italic leading-[1.2] max-w-2xl mx-auto mb-6 text-black">"The only coat I've needed for three Canadian winters."</blockquote>
          <p className="text-[11px] tracking-widest uppercase text-neutral-500">— Verified Customer, Toronto ON</p>
        </section>

        <section className="bg-black text-white py-20 px-6 md:px-10">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] tracking-widest uppercase text-white/40 mb-4">Stay in the loop</p>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Early access.<br /><em>No noise.</em></h2>
            <p className="text-[13px] text-white/50 mb-8">New arrivals, exclusive offers, and the occasional story about making things that last.</p>
            <div className="flex max-w-md mx-auto">
              <input type="email" placeholder="Your email address" className="flex-1 bg-transparent border border-white/20 px-4 py-3 text-[12px] outline-none placeholder:text-white/30 text-white focus:border-white/50 transition-colors" />
              <button className="bg-white text-black text-[10px] tracking-widest uppercase px-6 py-3 hover:bg-neutral-100 transition-colors whitespace-nowrap">Subscribe</button>
            </div>
            <p className="text-[10px] text-white/30 mt-3">No spam. Unsubscribe anytime.</p>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}

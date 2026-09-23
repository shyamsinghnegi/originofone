import Link from 'next/link'
import { Footer } from '@/components/ui'

const VALUES = [
  { num: '02', title: 'Fewer, better.', body: "We don't chase seasons. Every piece earns its place in our line. No filler, no fluff." },
  { num: '03', title: 'Built to last.', body: 'Premium materials — merino wool, responsible down, vegetable-tanned leather — because longevity is more sustainable than recycling.' },
  { num: '04', title: 'Made with purpose.', body: 'Every stitch, seam, and button is considered. We audit our supply chain annually and publish what we find.' },
]

const STATS = [
  { num: '2019', label: 'Founded in Toronto' },
  { num: '84',   label: 'Styles this season' },
  { num: '12k+', label: 'Canadians outfitted' },
  { num: '100%', label: 'Ethically sourced' },
]

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ── full bleed image with dark gradient */}
      <section className="min-h-screen bg-black text-white flex flex-col justify-end px-6 md:px-10 pb-16 pt-24 relative overflow-hidden">
        {/* Editorial Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/hero/hero-slide-3.jpg"
            alt="Origin of One Campaign"
            className="w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
        </div>

        <div className="relative z-10 max-w-5xl">
          <p className="text-[11px] tracking-widest uppercase text-white/60 mb-6">Est. Canada · Since 2019</p>
          <h1 className="font-serif leading-[0.95] mb-8" style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)' }}>
            Built on<br />one <em>belief.</em>
          </h1>
          <p className="text-[15px] text-white/70 max-w-lg leading-relaxed">
            That every wardrobe should have fewer, better things. That quality outlasts trends. That Canadian winters deserve clothing that actually works.
          </p>
        </div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className="py-28 px-6 md:px-10 text-center border-b border-neutral-200">
        <p className="font-serif text-[clamp(80px,16vw,160px)] leading-none text-neutral-100 select-none mb-[-2rem]">01</p>
        <h2 className="font-serif text-4xl md:text-6xl leading-[1.1] mb-8 relative z-10 text-black">
          We make clothes<br />for <em>real winters.</em>
        </h2>
        <p className="text-[15px] text-neutral-500 leading-relaxed max-w-2xl mx-auto">
          OriginofOne started with a simple observation: most winter clothing looks great in a showroom and falls apart in a blizzard. We set out to fix that — making garments that honour the Canadian cold without sacrificing simplicity or style. Every piece we make is designed to be worn hard, washed often, and kept for years.
        </p>
      </section>

      {/* ── VALUES ── */}
      <div className="grid md:grid-cols-3 border-b border-neutral-200">
        {VALUES.map((v, i) => (
          <div key={v.num} className={`px-8 py-12 ${i < 2 ? 'border-r border-neutral-200' : ''}`}>
            <p className="font-serif text-5xl text-neutral-200 leading-none mb-6">{v.num}</p>
            <h3 className="font-serif text-2xl md:text-3xl mb-4 text-black">{v.title}</h3>
            <p className="text-[13px] text-neutral-500 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      {/* ── STORY SPLIT ── */}
      <section className="grid md:grid-cols-2 border-b border-neutral-200">
        <div className="flex flex-col justify-center px-8 md:px-14 py-16 md:py-20 order-2 md:order-1 border-t md:border-t-0 md:border-r border-neutral-200">
          <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-6">The beginning</p>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] mb-8 text-black">
            Born from a<br /><em>Canadian winter.</em>
          </h2>
          <p className="text-[14px] text-neutral-500 leading-relaxed mb-5 max-w-md">
            OriginofOne was founded in 2019 by two friends tired of choosing between warmth and style. After one particularly brutal Toronto winter and one too many disappointing coats, they started designing their own.
          </p>
          <p className="text-[14px] text-neutral-500 leading-relaxed max-w-md">
            What began as a single overcoat has grown into a complete winter wardrobe — still minimal, still purposeful, still made to handle whatever the Canadian climate delivers.
          </p>
        </div>
        <div className="relative min-h-[50vh] md:min-h-[70vh] overflow-hidden order-1 md:order-2 bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/philosophy.jpg"
            alt="Master tailoring atelier"
            className="w-full h-full object-cover object-center brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200">
        {STATS.map((s, i) => (
          <div key={s.label} className={`py-12 text-center ${i < 3 ? 'border-r border-neutral-200' : ''}`}>
            <p className="font-serif text-5xl md:text-6xl leading-none mb-3 text-black">{s.num}</p>
            <p className="text-[11px] tracking-widest uppercase text-neutral-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── SUSTAINABILITY ── */}
      <section className="bg-black text-white grid md:grid-cols-2 border-b border-neutral-800">
        <div className="relative min-h-[45vh] md:min-h-full overflow-hidden flex items-end p-8 md:p-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://pub-ec92ce1f747e4291a5b3bfb149ddf271.r2.dev/hero/hero-slide-1.jpg"
            alt="Responsible Winter Fashion"
            className="absolute inset-0 w-full h-full object-cover object-center brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
          <h2 className="font-serif leading-[1.05] relative z-10" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            Clothing that<br /><em>does less harm.</em>
          </h2>
        </div>
        <div className="px-8 md:px-14 py-16 md:py-20 border-t md:border-t-0 border-l border-white/10 space-y-6">
          {[
            ['Responsible Sourcing', 'All wool is RWS-certified. Our down is Responsible Down Standard certified. We know where every material comes from.'],
            ['Minimal Packaging',    'All orders ship in recycled, unbleached mailers. No tissue paper, no branded inserts, no waste.'],
            ['Made to Last',         'Every piece comes with a lifetime repair guarantee. The most sustainable garment is the one you never throw away.'],
          ].map(([title, body]) => (
            <div key={title} className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
              <p className="text-[13px] text-white/80 mb-1">{title}</p>
              <p className="text-[12px] text-white/40 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center border-b border-neutral-200">
        <h2 className="font-serif text-5xl md:text-6xl leading-[1.1] mb-8 text-black">
          Ready to shop<br /><em>differently?</em>
        </h2>
        <Link
          href="/collection/all"
          className="inline-block bg-black text-white text-[11px] tracking-widest uppercase px-10 py-4 hover:bg-neutral-900 transition-colors"
        >
          Shop the Collection →
        </Link>
      </section>

      <Footer />
    </>
  )
}
export const runtime = 'edge'


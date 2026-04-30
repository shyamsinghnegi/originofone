import Link from 'next/link'
import { ProductCard, Footer } from '@/components/ui'

const MEN = [
  { id: 'tundra-wool-overcoat',  name: 'Tundra Wool Overcoat',  price: 348, badge: 'New',  colors: ['#1a1a1a','#525252','#d4d4d4'], bg: '#e5e5e5' },
  { id: 'nordic-puffer-jacket',  name: 'Nordic Puffer Jacket',  price: 278, badge: 'New',  colors: ['#0a0a0a','#737373'],           bg: '#d4d4d4' },
  { id: 'alpine-down-vest',      name: 'Alpine Down Vest',      price: 148, badge: 'New',                                           bg: '#e0e0e0' },
  { id: 'technical-shell-jacket',name: 'Technical Shell Jacket', price: 318, badge: 'New',  colors: ['#1a1a1a','#3d3d3d'],           bg: '#dadada' },
]

const WOMEN = [
  { id: 'merino-knit-sweater',   name: 'Merino Knit Sweater',   price: 168, badge: 'New',  colors: ['#d4d4d4','#525252','#0a0a0a'], bg: '#ebebeb' },
  { id: 'wool-wrap-coat',        name: 'Wool Wrap Coat',        price: 398, badge: 'New',  colors: ['#1a1a1a','#7a6e6e'],           bg: '#e8e0e0' },
  { id: 'cashmere-turtleneck',   name: 'Cashmere Turtleneck',   price: 228, badge: 'New',  colors: ['#e8e8e8','#c4b8a8'],           bg: '#ede8e2' },
  { id: 'quilted-liner-jacket',  name: 'Quilted Liner Jacket',  price: 198, badge: 'New',  colors: ['#1a1a1a','#2d2d2d'],           bg: '#dcdcdc' },
]

const CATEGORIES = [
  { label: 'All', href: '/new-in' },
  { label: 'Men', href: '/new-in#men' },
  { label: 'Women', href: '/new-in#women' },
  { label: 'Accessories', href: '/new-in#accessories' },
]

export default function NewInPage() {
  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        {/* Hero */}
        <div className="border-b border-neutral-200 px-6 md:px-10 py-14 md:py-20 grid md:grid-cols-2 items-end gap-6">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-3">Just Landed</p>
            <h1 className="font-serif text-5xl md:text-7xl text-black leading-[0.95]">New In</h1>
          </div>
          <div className="md:text-right">
            <p className="text-[13px] text-neutral-500 max-w-xs md:ml-auto">
              The latest additions to the Origin of One collection. Designed for Canadian winters, built to last.
            </p>
          </div>
        </div>

        {/* Category filter strip */}
        <div className="border-b border-neutral-200 px-6 md:px-10 flex gap-6 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="text-[10px] tracking-widest uppercase text-neutral-500 hover:text-black transition-colors py-4 whitespace-nowrap border-b-2 border-transparent hover:border-black"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Men section */}
        <section id="men" className="px-6 md:px-10 py-16 border-b border-neutral-200">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">New Arrivals</p>
              <h2 className="font-serif text-3xl md:text-4xl text-black">Men</h2>
            </div>
            <Link href="/collection" className="text-[10px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors">
              View All Men →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {MEN.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>

        {/* Women section */}
        <section id="women" className="px-6 md:px-10 py-16 border-b border-neutral-200">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">New Arrivals</p>
              <h2 className="font-serif text-3xl md:text-4xl text-black">Women</h2>
            </div>
            <Link href="/collection" className="text-[10px] tracking-widest uppercase text-neutral-400 hover:text-black transition-colors">
              View All Women →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {WOMEN.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </section>

        {/* Accessories placeholder */}
        <section id="accessories" className="px-6 md:px-10 py-16">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">New Arrivals</p>
              <h2 className="font-serif text-3xl md:text-4xl text-black">Accessories</h2>
            </div>
          </div>
          <div className="border border-dashed border-neutral-200 py-20 text-center">
            <p className="text-[13px] text-neutral-400 mb-4">New accessories dropping soon.</p>
            <Link href="/collection" className="text-[10px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors">
              Browse All →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

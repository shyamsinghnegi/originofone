'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { ProductCard, Footer, COLOR_MAP, COLOR_TO_BG } from '@/components/ui'

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  return undefined
}

function toCard(p: NonNullable<ReturnType<typeof useQuery<typeof api.products.list>>>[number]) {
  const uniqueColors = [...new Set(p.variants.map(v => v.color))]
  const firstColor = uniqueColors[0]
  return (
    <ProductCard
      key={p._id}
      id={p.slug}
      name={p.name}
      price={p.price}
      originalPrice={p.compareAtPrice}
      badge={badgeFromTags(p.tags)}
      colors={uniqueColors.map(c => COLOR_MAP[c] ?? '#cccccc')}
      bg={COLOR_TO_BG[firstColor] ?? '#e8e8e8'}
      image={p.images[0]}
    />
  )
}

const SKELETON = [...Array(4)].map((_, i) => (
  <div key={i} className="aspect-3/4 bg-neutral-100 animate-pulse" />
))

export default function NewInPage() {
  const allNewIn = useQuery(api.products.list, { tag: 'new-in' })
  const allNew   = useQuery(api.products.list, { tag: 'new' })

  const newIn  = allNewIn ?? []
  const newArr = allNew   ?? []

  const men        = newIn.filter(p => p.tags.includes('men'))
  const women      = newIn.filter(p => p.tags.includes('women'))
  const accessories = newIn.filter(p => p.category === 'Accessories')

  // If no new-in tag, fall back to 'new'-tagged products for sections
  const menDisplay   = men.length   > 0 ? men   : newArr.filter(p => p.tags.includes('men')).slice(0, 4)
  const womenDisplay = women.length > 0 ? women : newArr.filter(p => p.tags.includes('women')).slice(0, 4)
  const accDisplay   = accessories.length > 0 ? accessories : []

  const loading = allNewIn === undefined || allNew === undefined

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
          {[
            { label: 'All',         href: '/new-in' },
            { label: 'Men',         href: '/new-in#men' },
            { label: 'Women',       href: '/new-in#women' },
            { label: 'Accessories', href: '/new-in#accessories' },
          ].map(cat => (
            <Link
              key={cat.label}
              href={cat.href}
              className="text-[10px] tracking-widest uppercase text-neutral-500 hover:text-black transition-colors py-4 whitespace-nowrap border-b-2 border-transparent hover:border-black"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Men */}
        {(loading || menDisplay.length > 0) && (
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
              {loading ? SKELETON : menDisplay.map(toCard)}
            </div>
          </section>
        )}

        {/* Women */}
        {(loading || womenDisplay.length > 0) && (
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
              {loading ? SKELETON : womenDisplay.map(toCard)}
            </div>
          </section>
        )}

        {/* Accessories */}
        <section id="accessories" className="px-6 md:px-10 py-16">
          <div className="flex items-baseline justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">New Arrivals</p>
              <h2 className="font-serif text-3xl md:text-4xl text-black">Accessories</h2>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{SKELETON}</div>
          ) : accDisplay.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {accDisplay.map(toCard)}
            </div>
          ) : (
            <div className="border border-dashed border-neutral-200 py-20 text-center">
              <p className="text-[13px] text-neutral-400 mb-4">New accessories dropping soon.</p>
              <Link href="/collection" className="text-[10px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors">
                Browse All →
              </Link>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  )
}

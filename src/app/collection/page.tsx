'use client'

import Link from 'next/link'
import { api } from '@/../convex/_generated/api'
import { useCachedQuery } from '@/lib/useCachedQuery'
import { COLOR_TO_BG } from '@/components/ui'
import { categoryToSlug } from '@/components/ProductGridPage'

const COLLECTIONS = [
  { label: 'Outerwear',   tagline: 'Cold-weather essentials' },
  { label: 'Knitwear',    tagline: 'Layer up' },
  { label: 'Layering',    tagline: 'Built for the in-between' },
  { label: 'Accessories', tagline: 'Finishing touches' },
]

export default function CollectionsPage() {
  const products = useCachedQuery(api.products.list, {}, 'products:all')

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        <div className="px-6 md:px-12 py-6 bg-neutral-200 border-b border-black/5">
          <h1 className="font-serif text-3xl md:text-4xl text-black">Collections</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-neutral-200">
          {COLLECTIONS.map(c => {
            const withPhoto = products?.find(p => p.category === c.label && p.images[0])
            const match = withPhoto ?? products?.find(p => p.category === c.label)
            const cover = withPhoto?.images[0]
            const bg = COLOR_TO_BG[match?.variants[0]?.color ?? ''] ?? '#d8d8d8'
            return (
              <Link key={c.label} href={`/collection/${categoryToSlug(c.label)}`} className="group block">
                <div
                  className="relative aspect-5/4 overflow-hidden rounded-xl"
                  style={{ background: bg }}
                >
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={c.label}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between pt-3">
                  <p className="text-[13px] text-black">{c.label}</p>
                  <span className="text-neutral-400 group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200">↗</span>
                </div>
                <p className="text-[11px] text-neutral-400">{c.tagline}</p>
              </Link>
            )
          })}

          <Link href="/collection/all" className="group block">
            <div className="relative aspect-5/4 overflow-hidden rounded-xl bg-black" />
            <div className="flex items-center justify-between pt-3">
              <p className="text-[13px] text-black">View All</p>
              <span className="text-neutral-400 group-hover:text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-200">↗</span>
            </div>
            <p className="text-[11px] text-neutral-400">Everything</p>
          </Link>
        </div>
      </div>
    </>
  )
}

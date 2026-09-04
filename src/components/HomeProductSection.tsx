'use client'

import Link from 'next/link'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useCachedQuery } from '@/lib/useCachedQuery'
import { ProductCard } from '@/components/ui'

type Product = NonNullable<ReturnType<typeof useQuery<typeof api.products.list>>>[number]

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  if (tags.includes('limited')) return 'Limited'
  return undefined
}

interface Props {
  eyebrow: string
  title: string
  viewAllHref: string
  filter: (p: Product) => boolean
  limit?: number
}

export function HomeProductSection({ eyebrow, title, viewAllHref, filter, limit = 4 }: Props) {
  const products = useCachedQuery(api.products.list, {}, 'products:all')

  const items = products?.filter(filter).slice(0, limit) ?? []
  const loading = products === undefined

  // Section quietly disappears once loaded if nothing matches the filter —
  // sparse catalogues shouldn't show an empty row with a "View All" that goes nowhere useful.
  if (!loading && items.length === 0) return null

  return (
    <section className="px-6 md:px-10 py-16 bg-neutral-50 border-t border-neutral-200">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-2">{eyebrow}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-black">{title}</h2>
        </div>
        <Link href={viewAllHref} className="text-[11px] tracking-widest uppercase text-neutral-500 hover:text-black transition-colors link-underline">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-6 md:gap-x-2 md:gap-y-8">
        {loading
          ? [...Array(limit)].map((_, i) => (
              <div key={i} className="aspect-3/4 rounded-xl bg-neutral-100 animate-pulse" />
            ))
          : items.map(p => (
              <ProductCard
                key={p._id}
                id={p.slug}
                productId={p._id}
                name={p.name}
                price={p.price}
                originalPrice={p.compareAtPrice}
                badge={badgeFromTags(p.tags)}
                image={p.images[0]}
                variants={p.variants}
              />
            ))}
      </div>
    </section>
  )
}

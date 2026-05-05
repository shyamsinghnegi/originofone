'use client'

import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { ProductCard, COLOR_MAP, COLOR_TO_BG } from '@/components/ui'

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  if (tags.includes('limited')) return 'Limited'
  return undefined
}

export function HomeNewArrivals() {
  const products = useQuery(api.products.list, { tag: 'new' })

  if (products === undefined) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse" />
        ))}
      </div>
    )
  }

  const items = products.slice(0, 4)

  if (items.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-neutral-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {items.map(p => {
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
      })}
    </div>
  )
}

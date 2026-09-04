'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useCachedQuery } from '@/lib/useCachedQuery'
import { ProductGridPage, categoryToSlug } from '@/components/ProductGridPage'

const SLUG_TO_CATEGORY: Record<string, string> = {
  all: 'All',
  outerwear: 'Outerwear',
  knitwear: 'Knitwear',
  layering: 'Layering',
  accessories: 'Accessories',
}

export default function CollectionCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = use(params)
  const router = useRouter()

  const activeCategory = SLUG_TO_CATEGORY[categorySlug.toLowerCase()] ?? 'All'
  const products = useCachedQuery(api.products.list, {}, 'products:all') as
    ReturnType<typeof useQuery<typeof api.products.list>>

  return (
    <ProductGridPage
      products={products}
      title={activeCategory === 'All' ? 'All Products' : activeCategory}
      showCategoryFilter
      activeCategory={activeCategory}
      onCategoryChange={c => router.push(`/collection/${categoryToSlug(c)}`)}
    />
  )
}

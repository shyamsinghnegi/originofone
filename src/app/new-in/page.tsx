'use client'

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useCachedQuery } from '@/lib/useCachedQuery'
import { ProductGridPage } from '@/components/ProductGridPage'

export default function NewInPage() {
  const allNewIn = useCachedQuery(api.products.list, { tag: 'new-in' }, 'products:tag:new-in')
  const allNew   = useCachedQuery(api.products.list, { tag: 'new' }, 'products:tag:new')
  const [activeCategory, setActiveCategory] = useState('All')

  const loading = allNewIn === undefined || allNew === undefined
  const products: ReturnType<typeof useQuery<typeof api.products.list>> = loading
    ? undefined
    : (allNewIn && allNewIn.length > 0 ? allNewIn : allNew) ?? []

  return (
    <ProductGridPage
      products={products}
      title="New In"
      showCategoryFilter
      activeCategory={activeCategory}
      onCategoryChange={setActiveCategory}
    />
  )
}

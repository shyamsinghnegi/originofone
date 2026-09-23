'use client'

import { useState } from 'react'
import { api } from '@/../convex/_generated/api'
import { useCachedQuery } from '@/lib/useCachedQuery'
import { ProductGridPage } from '@/components/ProductGridPage'

export default function NewInPage() {
  const products = useCachedQuery(api.products.list, {}, 'products:all')
  const [activeCategory, setActiveCategory] = useState('All')

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

export const runtime = 'edge'


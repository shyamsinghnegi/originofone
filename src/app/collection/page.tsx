'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { ProductCard, MarqueeStrip, Footer, COLOR_MAP, COLOR_TO_BG } from '@/components/ui'

const CATEGORIES = ['All', 'Outerwear', 'Knitwear', 'Layering', 'Accessories']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size', 'S/M', 'L/XL']
const FABRICS = ['Wool', 'Cashmere', 'Merino', 'Cotton', 'Down', 'Leather', 'Synthetic']

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  if (tags.includes('limited')) return 'Limited'
  return undefined
}

function CollectionInner() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category')
  const products = useQuery(api.products.list, {})

  const [activeCategory, setActiveCategory] = useState(
    CATEGORIES.includes(initialCategory ?? '') ? initialCategory! : 'All'
  )
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortByOpen, setSortByOpen] = useState(false)
  const [sort, setSort] = useState<'new' | 'old' | 'price-asc' | 'price-desc'>('new')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])

  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])

  const toggleSize = (s: string) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleColor = (c: string) =>
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const toggleFabric = (f: string) =>
    setSelectedFabrics(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])

  const clearFilters = () => {
    setActiveCategory('All')
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedFabrics([])
  }

  const filtered = useMemo(() => {
    if (!products) return []
    let list = [...products]
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory)
    if (selectedSizes.length > 0)
      list = list.filter(p => p.variants.some(v => selectedSizes.includes(v.size)))
    if (selectedColors.length > 0)
      list = list.filter(p => p.variants.some(v => selectedColors.includes(v.color)))
    if (selectedFabrics.length > 0)
      list = list.filter(p => p.fabric && selectedFabrics.includes(p.fabric))
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'old') list.reverse()
    return list
  }, [products, activeCategory, selectedSizes, selectedColors, selectedFabrics, sort])

  const SORT_LABELS: Record<string, string> = {
    new: 'Date, new to old', old: 'Date, old to new',
    'price-asc': 'Price, low to high', 'price-desc': 'Price, high to low',
  }

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        {/* Filter strip */}
        <div className="sticky top-15 z-30 bg-paper/90 backdrop-blur-md py-3 w-full border-b border-black/5">
          <div className="flex items-center justify-between px-6 md:px-12 w-full">
            <div className="text-[11px] md:text-[11px] font-medium tracking-widest uppercase text-ink">
              {activeCategory === 'All' ? 'All Products' : activeCategory}
              {products !== undefined && ` · ${filtered.length}`}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              className="px-4 py-2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/5 text-[11px] md:text-[11px] text-ink hover:bg-neutral-50 transition-all whitespace-nowrap flex items-center gap-2 font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8"/><path d="M9 2v4.5L6 11v11h12V11l-3-4.5V2"/><path d="M6 11h12"/>
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Products grid */}
        <div className="px-6 md:px-12 py-8 min-h-screen bg-neutral-50">
          {products === undefined ? (
            <div className="flex justify-center py-32">
              <div className="w-5 h-5 border border-neutral-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-neutral-400 mb-4">No products found.</p>
              <button onClick={clearFilters} className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-x-4 md:gap-y-12">
              {filtered.map(p => {
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
          )}
        </div>
      </div>

      {/* Filter drawer */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-200 transition-opacity duration-300 ${filterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setFilterOpen(false)}
      />
      <div className={`fixed top-0 right-0 h-full w-85 max-w-[100vw] bg-paper z-201 flex flex-col transform transition-transform duration-400 ${filterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-center justify-center py-4 border-b border-black/10 relative">
          <h2 className="text-[11px] font-medium tracking-widest uppercase mb-0.5">Filter & Sort</h2>
          <p className="text-[10px] text-muted">{filtered.length} Products</p>
          <button onClick={() => setFilterOpen(false)} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 -mr-2 text-muted hover:text-ink transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7" data-lenis-prevent="true">
          {/* Category */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Category</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-4 h-7 rounded-full text-[11px] transition-colors ${activeCategory === c ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`min-w-9 px-2 h-7 rounded-full text-[11px] transition-colors ${selectedSizes.includes(s) ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Color</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(COLOR_MAP).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => toggleColor(name)}
                  aria-label={name}
                  title={name}
                  className="w-7 h-7 rounded-full border-2 transition-colors"
                  style={{
                    background: hex,
                    borderColor: selectedColors.includes(name) ? '#000' : 'rgba(0,0,0,0.15)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Fabric Type */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Fabric Type</h3>
            <div className="flex flex-wrap gap-2">
              {FABRICS.map(f => (
                <button
                  key={f}
                  onClick={() => toggleFabric(f)}
                  className={`px-3 h-7 rounded-full text-[11px] transition-colors ${selectedFabrics.includes(f) ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="border-t border-black/10 pt-6">
            <button onClick={() => setSortByOpen(v => !v)} className="flex justify-between items-center w-full text-[11px]">
              <span className="text-ink font-medium">Sort by</span>
              <span className="flex items-center gap-1.5 text-muted">
                {SORT_LABELS[sort]}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${sortByOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${sortByOpen ? 'max-h-50 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-2.5 pl-3 border-l border-black/10 text-[11px]">
                {(Object.entries(SORT_LABELS) as [string, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key as typeof sort)}
                    className={`text-left ${sort === key ? 'font-medium text-ink' : 'text-muted hover:text-ink'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-black/10 bg-paper flex gap-2.5">
          <button
            onClick={clearFilters}
            className="flex-1 py-3 rounded-full border border-black/10 text-[10px] tracking-widest uppercase hover:border-black/30 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => setFilterOpen(false)}
            className="flex-1 py-3 rounded-full bg-ink text-paper text-[10px] tracking-widest uppercase hover:bg-gray-900 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      <MarqueeStrip items={['Free Returns', '·', 'Ships Across Canada', '·', 'Ethically Sourced', '·', 'Premium Materials']} />
      <Footer />
    </>
  )
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        <div className="w-5 h-5 border border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <CollectionInner />
    </Suspense>
  )
}

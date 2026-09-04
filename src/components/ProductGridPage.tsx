'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ProductCard, MarqueeStrip, Footer, COLOR_MAP, BRAND_COLORS } from '@/components/ui'
import { useGsapPanel } from '@/lib/useGsapPanel'

export const CATEGORIES = ['All', 'Outerwear', 'Knitwear', 'Layering', 'Accessories']

export function categoryToSlug(category: string): string {
  return category === 'All' ? 'all' : category.toLowerCase()
}
const SIZES = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const FABRICS = ['Wool', 'Cashmere', 'Merino', 'Cotton', 'Down', 'Leather', 'Synthetic']
const OTHER_COLORS = Object.keys(COLOR_MAP).filter(c => !BRAND_COLORS.includes(c))

type Product = {
  _id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  category: string
  fabric?: string
  tags: string[]
  images: string[]
  variants: { color: string; size: string; stock: number }[]
}

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  if (tags.includes('limited')) return 'Limited'
  return undefined
}

const SORT_LABELS: Record<string, string> = {
  new: 'Date, new to old', old: 'Date, old to new',
  'price-asc': 'Price, low to high', 'price-desc': 'Price, high to low',
}

interface Props {
  products: Product[] | undefined
  title: string
  /** Show the category pill row + drawer category section. Off for pages already scoped to one thing (e.g. a single-category collection page with no need to switch). */
  showCategoryFilter?: boolean
  activeCategory?: string
  onCategoryChange?: (c: string) => void
  skeletonCount?: number
}

export function ProductGridPage({
  products, title, showCategoryFilter = true,
  activeCategory = 'All', onCategoryChange, skeletonCount = 12,
}: Props) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortByOpen, setSortByOpen] = useState(false)
  const [sort, setSort] = useState<'new' | 'old' | 'price-asc' | 'price-desc'>('new')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [availability, setAvailability] = useState<'in-stock' | 'out-of-stock' | null>(null)
  const filterBackdropRef = useRef<HTMLDivElement>(null)
  const filterPanelRef = useRef<HTMLDivElement>(null)
  useGsapPanel(filterOpen, filterPanelRef, filterBackdropRef, { from: 'right' })

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
  const toggleAvailability = (a: 'in-stock' | 'out-of-stock') =>
    setAvailability(prev => prev === a ? null : a)

  const clearFilters = () => {
    onCategoryChange?.('All')
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedFabrics([])
    setAvailability(null)
  }

  const filtered = useMemo(() => {
    if (!products) return []
    let list = [...products]
    if (showCategoryFilter && activeCategory !== 'All') list = list.filter(p => p.category === activeCategory)
    if (selectedSizes.length > 0)
      list = list.filter(p => p.variants.some(v => selectedSizes.includes(v.size)))
    if (selectedColors.length > 0)
      list = list.filter(p => p.variants.some(v => selectedColors.includes(v.color)))
    if (selectedFabrics.length > 0)
      list = list.filter(p => p.fabric && selectedFabrics.includes(p.fabric))
    if (availability === 'in-stock')
      list = list.filter(p => p.variants.some(v => v.stock > 0))
    else if (availability === 'out-of-stock')
      list = list.filter(p => p.variants.every(v => v.stock <= 0))
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'old') list.reverse()
    return list
  }, [products, showCategoryFilter, activeCategory, selectedSizes, selectedColors, selectedFabrics, availability, sort])

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        {/* Filter strip */}
        <div className="sticky top-15 z-30 bg-paper/90 backdrop-blur-md py-3 w-full border-b border-black/5">
          <div className="flex items-center justify-between px-6 md:px-12 w-full">
            <div className="text-[11px] md:text-[11px] font-medium tracking-widest uppercase text-ink">
              {title}
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

        {/* Category pills */}
        {showCategoryFilter && onCategoryChange && (
          <div className="px-6 md:px-12 py-4 bg-neutral-200 border-b border-black/5 overflow-x-auto" data-lenis-prevent="true">
            <div className="flex gap-2 w-max">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => onCategoryChange(c)}
                  className={`px-4 h-8 rounded-full text-[12px] whitespace-nowrap transition-colors ${
                    activeCategory === c ? 'bg-ink text-paper' : 'bg-white border border-black/10 text-ink hover:border-black/30'
                  }`}
                >
                  {c === 'All' ? 'View all' : c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        <div className="px-6 md:px-12 py-8 min-h-screen bg-neutral-200">
          {products === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-6 md:gap-x-2 md:gap-y-8">
              {[...Array(skeletonCount)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-3/4 rounded-xl bg-neutral-300 animate-pulse mb-2" />
                  <div className="h-3 w-3/4 rounded bg-neutral-300 animate-pulse mb-1.5" />
                  <div className="h-3 w-1/3 rounded bg-neutral-300 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-neutral-400 mb-4">No products found.</p>
              <button onClick={clearFilters} className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-6 md:gap-x-2 md:gap-y-8">
              {filtered.map(p => (
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
          )}
        </div>
      </div>

      {/* Filter drawer */}
      <div
        ref={filterBackdropRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-200"
        style={{ pointerEvents: filterOpen ? 'auto' : 'none' }}
        onClick={() => setFilterOpen(false)}
      />
      <div ref={filterPanelRef} className="fixed top-0 right-0 h-full w-105 max-w-[100vw] bg-paper z-201 flex flex-col" style={{ pointerEvents: filterOpen ? 'auto' : 'none' }}>
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
          {showCategoryFilter && onCategoryChange && (
            <div>
              <h3 className="text-[11px] mb-2.5 text-ink font-medium">Category</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    onClick={() => onCategoryChange(c)}
                    className={`px-4 h-7 rounded-full text-[11px] transition-colors ${activeCategory === c ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

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

          {/* Color — brand palette featured first, then the broader set */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Origin of One Palette</h3>
            <div className="flex flex-col gap-2 mb-4">
              {BRAND_COLORS.map(name => (
                <button
                  key={name}
                  onClick={() => toggleColor(name)}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-full border transition-colors text-left ${
                    selectedColors.includes(name) ? 'border-ink bg-black/5' : 'border-black/10 hover:border-black/30'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                    style={{ background: COLOR_MAP[name] }}
                  />
                  <span className="text-[11px] text-ink">{name}</span>
                </button>
              ))}
            </div>
            <h4 className="text-[10px] tracking-widest uppercase text-muted mb-2">More Colors</h4>
            <div className="flex flex-wrap gap-3">
              {OTHER_COLORS.map(name => (
                <button
                  key={name}
                  onClick={() => toggleColor(name)}
                  aria-label={name}
                  title={name}
                  className="w-7 h-7 rounded-full border-2 transition-colors"
                  style={{
                    background: COLOR_MAP[name],
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

          {/* Availability */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Availability</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleAvailability('in-stock')}
                className={`px-4 h-7 rounded-full text-[11px] transition-colors ${availability === 'in-stock' ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
              >
                In stock
              </button>
              <button
                onClick={() => toggleAvailability('out-of-stock')}
                className={`px-4 h-7 rounded-full text-[11px] transition-colors ${availability === 'out-of-stock' ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
              >
                Out of stock
              </button>
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

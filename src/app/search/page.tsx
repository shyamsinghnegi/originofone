'use client'

import { useState, useEffect, useMemo, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { ProductCard, MarqueeStrip, Footer, COLOR_MAP, BRAND_COLORS } from '@/components/ui'
import { useGsapPanel } from '@/lib/useGsapPanel'

const CATEGORIES = ['All', 'Outerwear', 'Knitwear', 'Layering', 'Accessories']
const SIZES = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const FABRICS = ['Wool', 'Cashmere', 'Merino', 'Cotton', 'Down', 'Leather', 'Synthetic']
const OTHER_COLORS = Object.keys(COLOR_MAP).filter(c => !BRAND_COLORS.includes(c))

function badgeFromTags(tags: string[]): string | undefined {
  if (tags.includes('new') || tags.includes('new-in')) return 'New'
  if (tags.includes('bestseller')) return 'Bestseller'
  if (tags.includes('sale')) return 'Sale'
  if (tags.includes('limited')) return 'Limited'
  return undefined
}

const SORT_LABELS: Record<string, string> = {
  new: 'Date, new to old',
  old: 'Date, old to new',
  'price-asc': 'Price, low to high',
  'price-desc': 'Price, high to low',
}

function SearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''

  const [inputValue, setInputValue] = useState(initialQ)
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [availability, setAvailability] = useState<'in-stock' | 'out-of-stock' | null>(null)
  const [sort, setSort] = useState<'new' | 'old' | 'price-asc' | 'price-desc'>('new')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortByOpen, setSortByOpen] = useState(false)
  const filterBackdropRef = useRef<HTMLDivElement>(null)
  const filterPanelRef = useRef<HTMLDivElement>(null)
  useGsapPanel(filterOpen, filterPanelRef, filterBackdropRef, { from: 'right' })

  // Sync inputValue when URL changes
  useEffect(() => { setInputValue(initialQ) }, [initialQ])

  useEffect(() => {
    document.body.style.overflow = filterOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [filterOpen])

  const results = useQuery(
    api.products.search,
    initialQ.trim().length >= 2 ? { query: initialQ.trim() } : 'skip'
  )

  const filtered = useMemo(() => {
    const list = results ?? []
    let out = [...list]
    if (activeCategory !== 'All') out = out.filter(p => p.category === activeCategory)
    if (selectedSizes.length > 0) out = out.filter(p => p.variants.some(v => selectedSizes.includes(v.size)))
    if (selectedColors.length > 0) out = out.filter(p => p.variants.some(v => selectedColors.includes(v.color)))
    if (selectedFabrics.length > 0) out = out.filter(p => p.fabric && selectedFabrics.includes(p.fabric))
    if (availability === 'in-stock') out = out.filter(p => p.variants.some(v => v.stock > 0))
    else if (availability === 'out-of-stock') out = out.filter(p => p.variants.every(v => v.stock <= 0))
    if (sort === 'price-asc') out.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price)
    else if (sort === 'old') out.reverse()
    return out
  }, [results, activeCategory, selectedSizes, selectedColors, selectedFabrics, availability, sort])

  const toggleSize = (s: string) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleColor = (c: string) =>
    setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const toggleFabric = (f: string) =>
    setSelectedFabrics(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  const toggleAvailability = (a: 'in-stock' | 'out-of-stock') =>
    setAvailability(prev => prev === a ? null : a)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`)
    setActiveCategory('All')
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedFabrics([])
    setAvailability(null)
  }

  const clearFilters = () => {
    setActiveCategory('All')
    setSelectedSizes([])
    setSelectedColors([])
    setSelectedFabrics([])
    setAvailability(null)
  }

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        {/* Header */}
        <div className="px-6 md:px-12 py-6 border-b border-border">
          {/* Inline search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-xl border-b border-black pb-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted text-ink"
              autoComplete="off"
            />
            {inputValue && (
              <button type="button" onClick={() => setInputValue('')} className="text-muted hover:text-ink transition-colors">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button type="submit" aria-label="Submit search" className="text-muted hover:text-ink transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>
        </div>

        {/* Filter strip + category pills — one continuous grey band */}
        <div className="sticky top-15 z-30 bg-neutral-200/95 backdrop-blur-md pt-4 pb-3 w-full border-b border-black/5">
          <div className="flex items-center justify-between px-6 md:px-12 w-full mb-3">
            <div className="text-[11px] md:text-[11px] font-medium tracking-widest uppercase text-ink">
              {!initialQ
                ? 'Enter a search term'
                : (activeCategory === 'All' ? 'All Results' : activeCategory)}
              {initialQ && results !== undefined && ` · ${filtered.length}`}
              {selectedSizes.length > 0 && ` · ${selectedSizes.join(', ')}`}
              {selectedColors.length > 0 && ` · ${selectedColors.join(', ')}`}
              {selectedFabrics.length > 0 && ` · ${selectedFabrics.join(', ')}`}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              className="px-4 py-2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/5 text-[11px] md:text-[11px] text-ink hover:bg-neutral-50 transition-all whitespace-nowrap flex items-center gap-2 font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8" /><path d="M9 2v4.5L6 11v11h12V11l-3-4.5V2" /><path d="M6 11h12" />
              </svg>
              Filters
            </button>
          </div>

          {initialQ && (
            <div className="relative">
              <div className="px-6 md:px-12 overflow-x-auto" data-lenis-prevent="true">
                <div className="flex gap-2 w-max">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`px-4 h-8 rounded-full text-[12px] whitespace-nowrap transition-colors ${
                        activeCategory === c ? 'bg-ink text-paper' : 'bg-white border border-black/10 text-ink hover:border-black/30'
                      }`}
                    >
                      {c === 'All' ? 'View all' : c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-white to-transparent" />
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="px-6 md:px-12 py-8 min-h-screen bg-neutral-200">
          {!initialQ ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-neutral-400">Start typing to search.</p>
            </div>
          ) : results === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-6 md:gap-x-2 md:gap-y-8">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="aspect-3/4 rounded-xl bg-neutral-300 animate-pulse mb-2" />
                  <div className="h-3 w-3/4 rounded bg-neutral-300 animate-pulse mb-1.5" />
                  <div className="h-3 w-1/3 rounded bg-neutral-300 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-neutral-400 mb-4">No results found.</p>
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-200 invisible opacity-0"
        style={{ pointerEvents: filterOpen ? 'auto' : 'none' }}
        onClick={() => setFilterOpen(false)}
      />
      <div ref={filterPanelRef} className="fixed top-0 right-0 h-screen w-105 max-w-[100vw] bg-paper z-201 flex flex-col invisible" style={{ pointerEvents: filterOpen ? 'auto' : 'none' }}>
        <div className="flex flex-col items-center justify-center py-4 border-b border-black/10 relative">
          <h2 className="text-[11px] font-medium tracking-widest uppercase mb-0.5">Filter & Sort</h2>
          <p className="text-[10px] text-muted">{filtered.length} Results</p>
          <button onClick={() => setFilterOpen(false)} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 -mr-2 text-muted hover:text-ink transition-colors">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7" data-lenis-prevent="true">
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="px-6 md:px-12 py-8 min-h-screen bg-neutral-200" style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-1 gap-y-6 md:gap-x-2 md:gap-y-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-3/4 rounded-xl bg-neutral-300 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}

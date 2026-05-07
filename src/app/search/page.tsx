'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { ProductCard, MarqueeStrip, Footer, COLOR_MAP, COLOR_TO_BG } from '@/components/ui'

const CATEGORIES = ['All', 'Outerwear', 'Knitwear', 'Layering', 'Accessories']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size', 'S/M', 'L/XL']

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
  const [sort, setSort] = useState<'new' | 'old' | 'price-asc' | 'price-desc'>('new')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortByOpen, setSortByOpen] = useState(false)

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
    if (sort === 'price-asc') out.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') out.sort((a, b) => b.price - a.price)
    else if (sort === 'old') out.reverse()
    return out
  }, [results, activeCategory, selectedSizes, sort])

  const toggleSize = (s: string) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`)
    setActiveCategory('All')
    setSelectedSizes([])
  }

  const clearFilters = () => { setActiveCategory('All'); setSelectedSizes([]) }

  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        {/* Header */}
        <div className="px-6 md:px-12 py-8 border-b border-border">
          <p className="text-[9px] tracking-widest uppercase text-muted mb-2">
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
            {' / '}Search
          </p>
          <h1 className="font-serif text-4xl md:text-[44px] text-ink leading-none mb-5">
            {initialQ ? `Results for "${initialQ}"` : 'Search'}
          </h1>

          {/* Inline search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-3 max-w-xl border-b border-black pb-2">
            <input
              type="search"
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

          <p className="text-[10px] text-muted mt-3">
            {!initialQ
              ? 'Enter a search term above'
              : results === undefined
              ? 'Loading…'
              : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filter strip */}
        <div className="sticky top-15 z-30 bg-paper/90 backdrop-blur-md py-3 w-full border-b border-black/5">
          <div className="flex items-center justify-between px-6 md:px-12 w-full">
            <div className="text-[10px] md:text-[11px] font-medium tracking-widest uppercase text-ink">
              {activeCategory === 'All' ? 'All Results' : activeCategory}
              {selectedSizes.length > 0 && ` · ${selectedSizes.join(', ')}`}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              className="px-4 py-2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/5 text-[10px] md:text-[11px] text-ink hover:bg-neutral-50 transition-all whitespace-nowrap flex items-center gap-2 font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8" /><path d="M9 2v4.5L6 11v11h12V11l-3-4.5V2" /><path d="M6 11h12" />
              </svg>
              Filters
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="px-6 md:px-12 py-8 min-h-screen">
          {!initialQ ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-neutral-400">Start typing to search.</p>
            </div>
          ) : results === undefined ? (
            <div className="flex justify-center py-32">
              <div className="w-5 h-5 border border-neutral-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-serif text-2xl text-neutral-400 mb-4">No results found.</p>
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
          <h2 className="text-[10px] font-medium tracking-widest uppercase mb-0.5">Filter & Sort</h2>
          <p className="text-[9px] text-muted">{filtered.length} Results</p>
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
                  className={`px-4 h-7 rounded-full text-[10px] transition-colors ${activeCategory === c ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
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
                  className={`min-w-9 px-2 h-7 rounded-full text-[10px] transition-colors ${selectedSizes.includes(s) ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-black/10 pt-6">
            <button onClick={() => setSortByOpen(v => !v)} className="flex justify-between items-center w-full text-[10px]">
              <span className="text-ink font-medium">Sort by</span>
              <span className="flex items-center gap-1.5 text-muted">
                {SORT_LABELS[sort]}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${sortByOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${sortByOpen ? 'max-h-50 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-2.5 pl-3 border-l border-black/10 text-[10px]">
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
            className="flex-1 py-3 rounded-full border border-black/10 text-[9px] tracking-widest uppercase hover:border-black/30 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => setFilterOpen(false)}
            className="flex-1 py-3 rounded-full bg-ink text-paper text-[9px] tracking-widest uppercase hover:bg-gray-900 transition-colors"
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
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        <div className="w-5 h-5 border border-neutral-300 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}

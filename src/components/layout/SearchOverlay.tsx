'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/../convex/_generated/api'

const CATEGORIES = ['Outerwear', 'Knitwear', 'Layering', 'Accessories']

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 280)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setDebouncedQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const results = useQuery(
    api.products.search,
    debouncedQuery.trim().length >= 2 ? { query: debouncedQuery.trim() } : 'skip'
  )

  const navigate = (path: string) => { router.push(path); onClose() }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const suggestions = buildSuggestions(query, results ?? [])
  const hasResults = debouncedQuery.trim().length >= 2

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[98] bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ top: 'var(--nav-height, 60px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Search"
        aria-modal="true"
        className={`fixed left-0 right-0 z-[99] bg-paper shadow-xl transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-3 pointer-events-none'}`}
        style={{ top: 'var(--nav-height, 60px)' }}
      >
        {/* Input row */}
        <form onSubmit={handleSubmit} className="border-b border-border">
          <div className="flex items-center gap-3 px-6 md:px-12 py-4">
            <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24" className="text-muted shrink-0">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted text-ink"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="text-muted hover:text-ink transition-colors"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="text-muted hover:text-ink transition-colors ml-1"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </form>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto" data-lenis-prevent="true">
          {!hasResults ? (
            /* Empty state — show collections */
            <div className="px-6 md:px-12 py-8">
              <p className="text-[9px] tracking-widest uppercase text-muted mb-5">Collections</p>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => navigate(`/collection?category=${cat}`)}
                  className="flex items-center justify-between w-full py-4 border-b border-border text-left group"
                >
                  <span className="text-[13px] text-ink group-hover:text-muted transition-colors">{cat}</span>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          ) : results === undefined ? (
            /* Loading */
            <div className="flex justify-center py-16">
              <div className="w-4 h-4 border border-neutral-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            /* No results */
            <div className="px-6 md:px-12 py-16 text-center">
              <p className="font-serif text-2xl text-neutral-400 mb-2">No results</p>
              <p className="text-[12px] text-muted">No products found for &ldquo;{debouncedQuery}&rdquo;</p>
            </div>
          ) : (
            /* Results: suggestions + product rows */
            <div className="px-6 md:px-12 py-7 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-14">
              {/* Suggestions */}
              <div>
                <p className="text-[9px] tracking-widest uppercase text-muted mb-4">Suggestions</p>
                <div className="flex flex-col gap-3">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                      className="text-left text-[13px] text-ink hover:text-muted transition-colors"
                    >
                      {highlightMatch(s, query)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product rows */}
              <div>
                <p className="text-[9px] tracking-widest uppercase text-muted mb-4">Products</p>
                <div>
                  {results.slice(0, 5).map(p => (
                    <Link
                      key={p._id}
                      href={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-3 border-b border-border group"
                    >
                      <div className="w-14 h-14 shrink-0 bg-neutral-100 overflow-hidden">
                        {p.images[0]
                          ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-neutral-200" />
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-ink group-hover:text-muted transition-colors truncate">{p.name}</p>
                        <p className="text-[11px] text-muted mt-0.5">${p.price} CAD · {p.category}</p>
                      </div>
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-muted shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA — only when there are results */}
        {hasResults && results && results.length > 0 && (
          <div className="border-t border-border">
            <button
              onClick={handleSubmit}
              className="w-full px-6 md:px-12 py-4 flex items-center justify-between text-[10px] tracking-widest uppercase hover:bg-neutral-50 transition-colors"
            >
              <span>Search for &ldquo;{query}&rdquo;</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function buildSuggestions(query: string, products: { name: string; category: string }[]): string[] {
  if (!query.trim()) return []
  const q = query.trim()
  const ql = q.toLowerCase()
  const suggestions = new Set<string>([q])

  for (const p of products) {
    // Add full product name
    suggestions.add(p.name)
    // Add "word + query" prefix fragments (e.g. "leather" + "jacket")
    const words = p.name.split(' ')
    const matchStart = words.findIndex((_, i) =>
      words.slice(i).join(' ').toLowerCase().startsWith(ql)
    )
    if (matchStart > 0) {
      suggestions.add(words.slice(matchStart).join(' '))
    }
    // Add category as suggestion
    if (p.category.toLowerCase().includes(ql)) {
      suggestions.add(p.category)
    }
  }

  return [...suggestions].slice(0, 6)
}

function highlightMatch(text: string, query: string): React.ReactNode {
  const ql = query.trim().toLowerCase()
  const idx = text.toLowerCase().indexOf(ql)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-semibold">{text.slice(idx, idx + ql.length)}</strong>
      {text.slice(idx + ql.length)}
    </>
  )
}

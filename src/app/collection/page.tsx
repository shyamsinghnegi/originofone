'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProductCard, MarqueeStrip, Footer } from '@/components/ui'

const PRODUCTS = [
  { id: 'tundra-wool-overcoat',  name: 'Tundra Wool Overcoat',  price: 348, badge: 'New',        colors: ['#1a1a1a', '#525252', '#d4d4d4'], bg: '#e5e5e5' },
  { id: 'nordic-puffer-jacket',  name: 'Nordic Puffer Jacket',  price: 278, badge: 'Bestseller', colors: ['#0a0a0a', '#737373'],            bg: '#d4d4d4' },
  { id: 'merino-knit-sweater',   name: 'Merino Knit Sweater',   price: 168,                      colors: ['#d4d4d4', '#525252', '#0a0a0a'], bg: '#ebebeb' },
  { id: 'alpine-down-vest',      name: 'Alpine Down Vest',      price: 148, originalPrice: 198,  badge: 'Sale',                             bg: '#e0e0e0' },
  { id: 'heritage-wool-coat',    name: 'Heritage Wool Coat',    price: 398,                      colors: ['#404040', '#d4d4d4'],            bg: '#cccccc' },
  { id: 'thermal-base-layer',    name: 'Thermal Base Layer',    price: 128, badge: 'New',        colors: ['#0a0a0a', '#f5f5f5', '#525252'], bg: '#e8e8e8' },
  { id: 'wool-beanie',           name: 'Wool Beanie',           price: 58,                                                                  bg: '#d4d4d4' },
  { id: 'cashmere-scarf',        name: 'Cashmere Scarf',        price: 88,                                                                  bg: '#e5e5e5' },
  { id: 'leather-gloves',        name: 'Leather Gloves',        price: 118, badge: 'Limited',                                              bg: '#e0e0e0' },
]

const CATEGORIES = ['All', 'Outerwear', 'Knitwear', 'Layering', 'Accessories', 'New In', 'Sale']

// Filter Drawer Data
const SIZES = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
const AVAILABILITY = ['In stock', 'Out of stock']
const TYPES = ['T-shirt', 'Hoodie', 'Outerwear', 'Accessories']
const COLOR_GROUPS = [
  { id: 'blues', label: 'Blues', dots: ['#93c5fd', '#3b82f6', '#1e3a8a'] },
  { id: 'neutrals', label: 'Neutrals', dots: ['#f5f5f5', '#a3a3a3', '#171717'] },
  { id: 'reds', label: 'Reds', dots: ['#fca5a5', '#ef4444', '#7f1d1d'] },
]

export default function CollectionPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortByOpen, setSortByOpen] = useState(false)

  // Filter States
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedAvail, setSelectedAvail] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (filterOpen) {
      document.documentElement.classList.add('lenis-stopped')
    } else {
      document.documentElement.classList.remove('lenis-stopped')
    }
  }, [filterOpen])

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const clearAllFilters = () => {
    setSelectedSizes([])
    setSelectedAvail([])
    setSelectedTypes([])
    setSelectedColors([])
  }

  return (
    <>
      {/* Page offset — clears fixed nav */}
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>

        {/* Page header */}
        <div className="px-6 md:px-12 py-8 border-b border-border flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[9px] tracking-widest uppercase text-muted mb-2">
              <Link href="/" className="hover:text-ink transition-colors">Home</Link>
              {' / '}Collections
            </p>
            <h1 className="font-serif text-4xl md:text-[44px] text-ink leading-none">Winter Collection</h1>
            <p className="text-[10px] text-muted mt-2">{PRODUCTS.length} products</p>
          </div>
        </div>

        {/* Filter strip (Clean & Minimal) */}
        <div className="sticky top-[60px] z-30 bg-paper/90 backdrop-blur-md py-3 w-full border-b border-black/5">
          <div className="flex items-center justify-between px-6 md:px-12 w-full">
            
            {/* Active Category Title */}
            <div className="text-[10px] md:text-[11px] font-medium tracking-widest uppercase text-ink">
              {activeCategory === 'All' ? 'All Products' : activeCategory}
            </div>
            
            {/* Advance Filters Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="px-4 py-2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/5 text-[10px] md:text-[11px] text-ink hover:bg-neutral-50 transition-all whitespace-nowrap flex items-center gap-2 font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2h8"/>
                <path d="M9 2v4.5L6 11v11h12V11l-3-4.5V2"/>
                <path d="M6 11h12"/>
              </svg>
              Advance Filters
            </button>

          </div>
        </div>

        {/* Products Grid */}
        <div className="px-6 md:px-12 py-8 min-h-screen">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-x-4 md:gap-y-12">
            {PRODUCTS.map(p => <ProductCard key={p.id} {...p} />)}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-1 mt-16 mb-8">
            {[1, 2, 3].map(n => (
              <button
                key={n}
                className={`w-7 h-7 rounded-full text-[11px] transition-colors ${
                  n === 1
                    ? 'bg-ink text-paper'
                    : 'bg-black/5 text-ink hover:bg-black/10'
                }`}
              >
                {n}
              </button>
            ))}
            <button className="w-7 h-7 rounded-full text-[11px] bg-black/5 text-ink hover:bg-black/10 transition-colors flex items-center justify-center">
              →
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER DRAWER SYSTEM ────────────────────────────────────────── */}
      
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity duration-300 ${
          filterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setFilterOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[340px] max-w-[100vw] bg-paper z-[201] flex flex-col transform transition-transform duration-400 cubic-bezier(0.25, 0.46, 0.45, 0.94) ${
          filterOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex flex-col items-center justify-center py-4 border-b border-black/10 relative">
          <h2 className="text-[10px] font-medium tracking-[0.1em] uppercase mb-0.5">Filter</h2>
          <p className="text-[9px] text-muted">{PRODUCTS.length} Products</p>
          <button 
            onClick={() => setFilterOpen(false)} 
            className="absolute right-5 top-1/2 -translate-y-1/2 p-2 -mr-2 text-muted hover:text-ink transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-6 space-y-7 custom-scrollbar overscroll-contain touch-pan-y" 
          data-lenis-prevent="true"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          
          {/* Category Section (Now manages the primary category) */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Category</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => {
                const isActive = activeCategory === c
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-4 h-[28px] rounded-full text-[10px] transition-colors flex items-center justify-center ${
                      isActive ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Size Section */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => {
                const isActive = selectedSizes.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => toggleArrayItem(setSelectedSizes, s)}
                    className={`min-w-[36px] px-2 h-[28px] rounded-full text-[10px] transition-colors flex items-center justify-center ${
                      isActive ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Availability Section */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Availability</h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY.map(a => {
                const isActive = selectedAvail.includes(a)
                return (
                  <button
                    key={a}
                    onClick={() => toggleArrayItem(setSelectedAvail, a)}
                    className={`px-4 h-[28px] rounded-full text-[10px] transition-colors flex items-center justify-center ${
                      isActive ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'
                    }`}
                  >
                    {a}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Type Section */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Type</h3>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => {
                const isActive = selectedTypes.includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleArrayItem(setSelectedTypes, t)}
                    className={`px-4 h-[28px] rounded-full text-[10px] transition-colors flex items-center justify-center ${
                      isActive ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Section */}
          <div>
            <h3 className="text-[11px] mb-2.5 text-ink font-medium">Color</h3>
            <div className="flex flex-wrap gap-2">
              {COLOR_GROUPS.map(c => {
                const isActive = selectedColors.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleArrayItem(setSelectedColors, c.id)}
                    className={`flex items-center gap-2 px-3 h-[28px] rounded-full text-[10px] transition-colors ${
                      isActive ? 'bg-ink text-paper' : 'bg-black/5 text-ink hover:bg-black/10'
                    }`}
                  >
                    {c.label}
                    <div className="flex -space-x-1">
                      {c.dots.map((dotColor, idx) => (
                        <div 
                          key={idx} 
                          className="w-2.5 h-2.5 rounded-full border border-white/30" 
                          style={{ backgroundColor: dotColor }} 
                        />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sort By Dropdown inside Filter */}
          <div className="border-t border-black/10 pt-6 pb-2">
            <button 
              onClick={() => setSortByOpen(!sortByOpen)}
              className="flex justify-between items-center w-full text-[10px]"
            >
              <span className="text-ink">Sort by:</span>
              <span className="flex items-center gap-1.5 text-muted">
                Date, new to old
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${sortByOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>
            
            {/* Expanded Sort Options */}
            <div className={`overflow-hidden transition-all duration-300 ${sortByOpen ? 'max-h-[200px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="flex flex-col gap-2.5 pl-3 border-l border-black/10 text-[10px]">
                <button className="text-left hover:text-ink text-muted">Date, old to new</button>
                <button className="text-left font-medium text-ink">Date, new to old</button>
                <button className="text-left hover:text-ink text-muted">Price, low to high</button>
                <button className="text-left hover:text-ink text-muted">Price, high to low</button>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer (Sticky Actions) */}
        <div className="p-5 border-t border-black/10 bg-paper flex gap-2.5">
          <button 
            onClick={clearAllFilters}
            className="flex-1 py-3 rounded-full border border-black/10 text-[9px] tracking-widest uppercase hover:border-black/30 transition-colors"
          >
            Remove All
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
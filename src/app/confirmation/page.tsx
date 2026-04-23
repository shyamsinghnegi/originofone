import Link from 'next/link'
import { ProductCard, Footer } from '@/components/ui'

export default function ConfirmationPage() {
  return (
    <>
      {/* Page offset — clears fixed nav */}
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>

        {/* Success hero */}
        <div className="min-h-[50vh] flex flex-col items-center justify-center px-6 py-20 border-b border-neutral-200 text-center">
          <div className="w-14 h-14 rounded-full border border-neutral-200 flex items-center justify-center mb-8 text-lg text-black">
            ✓
          </div>
          <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-4">Order Confirmed</p>
          <h1 className="font-serif leading-[1.05] mb-6 text-black" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            Thank you,<br /><em>your order is placed.</em>
          </h1>
          <p className="text-[14px] text-neutral-500 max-w-md leading-relaxed">
            We've received your order and will send a confirmation to your email. Your items will be shipped within 2 business days.
          </p>
        </div>

        {/* Order details */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          {/* Order card */}
          <div className="border border-neutral-200 mb-8">
            <div className="flex justify-between items-start px-6 py-5 border-b border-neutral-200">
              <div>
                <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-1">Order number</p>
                <p className="font-serif text-lg text-black">#OO-2025-8847</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">December 14, 2025</p>
              </div>
              <span className="text-[10px] tracking-widest uppercase px-3 py-1.5 bg-neutral-100 text-black">
                Confirmed
              </span>
            </div>

            {/* Items */}
            <div className="px-6 py-5 border-b border-neutral-200 space-y-4">
              {[
                { name: 'Tundra Wool Overcoat', variant: 'Stone Grey · M',     price: 348, bg: '#e5e5e5' },
                { name: 'Wool Beanie',           variant: 'Charcoal · One Size', price: 58,  bg: '#d4d4d4' },
              ].map(item => (
                <div key={item.name} className="flex gap-4 items-center">
                  <div className="w-16 h-20 flex-shrink-0 flex items-end justify-center pb-1" style={{ background: item.bg }}>
                    <div className="relative w-8 h-14 rounded-t-full" style={{ background: 'rgba(0,0,0,0.18)' }}>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full" style={{ background: 'rgba(0,0,0,0.18)' }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-black">{item.name}</p>
                    <p className="text-[11px] text-neutral-400">{item.variant}</p>
                  </div>
                  <p className="text-[13px] text-black">${item.price}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 py-5 space-y-2">
              {[['Subtotal', '$406.00 CAD'], ['Shipping', 'Free'], ['Taxes', '$52.78 CAD']].map(([l, v]) => (
                <div key={l} className="flex justify-between text-[12px]">
                  <span className="text-neutral-400">{l}</span>
                  <span className={v === 'Free' ? 'text-black font-medium' : 'text-neutral-500'}>{v}</span>
                </div>
              ))}
              <div className="border-t border-neutral-200 pt-3 flex justify-between items-baseline">
                <span className="text-[11px] tracking-widest uppercase text-black">Total Charged</span>
                <span className="font-serif text-2xl text-black">$458.78 CAD</span>
              </div>
            </div>
          </div>

          {/* Shipping + Payment */}
          <div className="grid grid-cols-2 border border-neutral-200 divide-x divide-neutral-200 mb-8">
            <div className="px-5 py-5">
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-3">Shipping To</p>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Jane Smith<br />123 Main Street<br />Toronto, ON M5V 2T6<br />Canada
              </p>
            </div>
            <div className="px-5 py-5">
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-3">Payment</p>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                Visa ending in 4242<br />Billed $458.78 CAD<br /><br />Standard Shipping · 5–7 days
              </p>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-neutral-50 px-5 py-4 flex items-center justify-between mb-8 border border-neutral-200">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-1">Tracking (available once shipped)</p>
              <p className="text-[12px] tracking-wider text-black">1Z 999 AA1 01 2345 6784</p>
            </div>
            <button className="text-[11px] tracking-widest uppercase text-neutral-400 underline hover:text-black transition-colors">
              Track →
            </button>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Link
              href="/collection"
              className="flex-1 bg-black text-white text-[11px] tracking-widest uppercase text-center py-4 hover:bg-neutral-900 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="flex-1 border border-black text-[11px] tracking-widest uppercase text-center py-4 hover:bg-black hover:text-white transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>

        {/* Recommendations */}
        <section className="px-6 md:px-10 py-16 border-t border-neutral-200">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-serif text-3xl text-black">You Might Also Like</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <ProductCard id="merino-knit-sweater"  name="Merino Knit Sweater"  price={168} bg="#ebebeb" />
            <ProductCard id="cashmere-scarf"        name="Cashmere Scarf"       price={88}  bg="#e5e5e5" />
            <ProductCard id="heritage-wool-coat"    name="Heritage Wool Coat"   price={398} bg="#d4d4d4" />
          </div>
        </section>
      </div>

      <Footer />
    </>
  )
}
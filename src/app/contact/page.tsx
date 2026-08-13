import { Footer } from '@/components/ui'

export default function ContactPage() {
  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        <div className="max-w-2xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <h1 className="font-serif text-4xl md:text-5xl text-black mb-3">Contact Us</h1>
          <p className="text-[14px] text-neutral-500 mb-12">
            Questions about an order, sizing, or anything else — we usually reply within one business day.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-neutral-200 p-6">
              <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-2">General &amp; Order Support</p>
              <a href="mailto:support@originofone.ca" className="text-[15px] text-black underline">
                support@originofone.ca
              </a>
            </div>
            <div className="border border-neutral-200 p-6">
              <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-2">Privacy Requests</p>
              <a href="mailto:privacy@originofone.ca" className="text-[15px] text-black underline">
                privacy@originofone.ca
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-neutral-200 pt-8 text-[13px] text-neutral-500 leading-relaxed">
            <p className="mb-2"><strong className="text-black">Origin of One</strong></p>
            <p>Toronto, Ontario, Canada</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

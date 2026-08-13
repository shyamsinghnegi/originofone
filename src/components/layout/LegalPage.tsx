import { Footer } from '@/components/ui'

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <>
      <div style={{ paddingTop: 'var(--nav-height, 60px)' }}>
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-20">
          <h1 className="font-serif text-4xl md:text-5xl text-black mb-3">{title}</h1>
          <p className="text-[11px] tracking-widest uppercase text-neutral-400 mb-12">Last updated {updated}</p>
          <div className="space-y-10 text-[14px] text-neutral-600 leading-relaxed [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-black [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-black [&_a]:underline">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen flex flex-col items-center justify-center px-6">
      <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-3">403</p>
      <h1 className="font-serif text-5xl text-black mb-4">Access Denied</h1>
      <p className="text-[13px] text-neutral-500 mb-8 text-center max-w-sm">
        Your account does not have admin privileges. Contact the store owner to request access.
      </p>
      <Link
        href="/"
        className="text-[11px] tracking-widest uppercase border-b border-black pb-0.5 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
      >
        Back to Store
      </Link>
    </div>
  )
}

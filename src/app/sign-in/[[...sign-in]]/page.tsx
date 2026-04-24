'use client'

import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen grid md:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center px-8 md:px-16 py-16 border-r border-neutral-200">
        <p className="text-[10px] tracking-widest uppercase text-neutral-400 mb-2">My Account</p>
        <h1 className="font-serif text-4xl md:text-5xl text-black mb-10">Welcome back.</h1>
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none p-0 bg-transparent',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border border-neutral-200 text-[11px] tracking-widest uppercase rounded-none hover:border-black transition-colors',
              dividerText: 'text-[10px] tracking-widest uppercase text-neutral-400',
              formFieldLabel: 'text-[10px] tracking-widest uppercase text-neutral-500',
              formFieldInput: 'border border-neutral-200 rounded-none text-[13px] focus:border-black focus:ring-0 transition-colors',
              formButtonPrimary: 'bg-black hover:bg-neutral-900 rounded-none text-[11px] tracking-widest uppercase transition-colors',
              footerActionLink: 'text-black underline',
              identityPreviewEditButton: 'text-black',
              formResendCodeLink: 'text-black',
              otpCodeFieldInput: 'border-neutral-200 rounded-none',
            },
          }}
        />
      </div>

      {/* Brand side */}
      <div className="hidden md:flex bg-black items-end justify-center pb-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 80px, rgba(255,255,255,1) 80px, rgba(255,255,255,1) 81px)' }}
        />
        <div className="relative z-10 text-center px-10">
          <div className="relative mb-8 inline-block" style={{ width: 120, height: 280 }}>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-full w-14 h-14" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="w-full h-full rounded-t-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <div className="absolute rounded" style={{ top: '13%', left: '-40%', right: '-40%', height: '32%', background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <p className="font-serif text-white/50 text-xl italic">Members enjoy<br />early access to drops.</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div style={{ paddingTop: 'var(--nav-height, 60px)' }} className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm py-10">
        <div className="text-center mb-7">
          <h1 className="font-serif text-3xl text-black">Create account.</h1>
          <p className="text-[12px] text-neutral-400 mt-1.5">Join for early access and free shipping on your first order.</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/"
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none p-0 bg-transparent border-0',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'border border-neutral-200 rounded-none text-[11px] tracking-widest uppercase hover:border-black hover:bg-neutral-50 transition-colors h-10 w-full mb-2',
              socialButtonsBlockButtonText: 'text-[11px] tracking-widest uppercase font-normal',
              socialButtonsBlockButtonArrow: 'hidden',
              dividerLine: 'bg-neutral-200',
              dividerText: 'text-[10px] tracking-widest uppercase text-neutral-400 bg-white',
              formFieldLabel: 'text-[10px] tracking-widest uppercase text-neutral-500',
              formFieldInput: 'border border-neutral-200 rounded-none text-[13px] focus:border-black focus:ring-0 transition-colors h-10 px-3 w-full',
              formButtonPrimary: 'bg-black hover:bg-neutral-900 rounded-none text-[11px] tracking-widest uppercase transition-colors h-10 w-full',
              footerActionText: 'text-[11px] text-neutral-500',
              footerActionLink: 'text-black font-medium underline-offset-2 underline hover:text-neutral-700',
              footer: 'bg-transparent pt-4',
              identityPreviewEditButton: 'text-black',
              formResendCodeLink: 'text-black',
              otpCodeFieldInput: 'border-neutral-200 rounded-none',
              alertText: 'text-[12px]',
              cardBox: 'shadow-none border-0',
            },
          }}
        />
      </div>
    </div>
  )
}

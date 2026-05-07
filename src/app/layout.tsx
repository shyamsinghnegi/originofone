import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import { CartProvider } from '@/lib/cartContext'
import { ConvexClerkProvider } from '@/lib/convexProvider'
import { Nav } from '@/components/layout/Nav'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { ZoomLock } from '@/components/layout/ZoomLock'
import { UserSync } from '@/components/layout/UserSync'

const editorial = DM_Serif_Display({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-editorial',
})

const body = DM_Sans({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Origin of One — Canadian Winter Clothing',
  description: 'Premium winter essentials, crafted for Canadian winters. Minimal by design, exceptional in warmth.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${editorial.variable} ${body.variable}`}>
        <head />
        <body>
          <ConvexClerkProvider>
            <CartProvider>
              <UserSync />
              <ZoomLock />
              <SmoothScroll />
              <Nav />
              <CartDrawer />
              <main>{children}</main>
            </CartProvider>
          </ConvexClerkProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

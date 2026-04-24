import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import '../styles/globals.css'
import { CartProvider } from '@/lib/cartContext'
import { ConvexClerkProvider } from '@/lib/convexProvider'
import { Nav } from '@/components/layout/Nav'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { ZoomLock } from '@/components/layout/ZoomLock'

export const metadata: Metadata = {
  title: 'Origin of One — Canadian Winter Clothing',
  description: 'Premium winter essentials, crafted for Canadian winters. Minimal by design, exceptional in warmth.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ConvexClerkProvider>
            <CartProvider>
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

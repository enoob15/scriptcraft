import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://scriptcraft.boone51.com'),
  title: 'ScriptCraft | AI Video Script Generator',
  description:
    'ScriptCraft generates platform-optimized video scripts for TikTok, YouTube Shorts, Instagram Reels, X, and LinkedIn.',
  keywords: [
    'AI video script generator',
    'TikTok script generator',
    'YouTube Shorts writer',
    'Instagram Reels script',
    'creator SaaS',
  ],
  openGraph: {
    title: 'ScriptCraft | Stop staring at blank pages. Start creating viral content.',
    description:
      'Bootstrap-powered creator SaaS with Gemini script generation, Stripe billing, exports, and workflow tooling.',
    url: 'https://scriptcraft.boone51.com',
    siteName: 'ScriptCraft',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScriptCraft',
    description: 'AI video scripts with SaaS-ready billing and creator ops.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          data-endpoint="https://pinpoint.boone51.com/api/ingest"
          data-project="scriptcraft-b51"
          id="pinpoint-widget"
          src="https://pinpoint.boone51.com/widget/pinpoint.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}

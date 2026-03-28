import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScriptCraft - AI-Powered Video Script Generator',
  description: 'Generate engaging video scripts for TikTok, YouTube Shorts, Instagram Reels and more using AI',
  keywords: 'video script generator, AI script writer, TikTok scripts, YouTube Shorts, Instagram Reels, content creation',
  openGraph: {
    title: 'ScriptCraft - AI Video Script Generator',
    description: 'Create viral video scripts in seconds with AI',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
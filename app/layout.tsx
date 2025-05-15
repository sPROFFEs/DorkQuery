import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import CriticalCSS from "@/components/critical-css"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Visual Dork Builder",
  description: "Build Google Dorks visually by dragging and connecting blocks",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
        {/* Add critical CSS inline */}
        <CriticalCSS />
        {/* Add fallback CSS */}
        <link rel="stylesheet" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/fallback.css`} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-black text-white`}>{children}</body>
    </html>
  )
}

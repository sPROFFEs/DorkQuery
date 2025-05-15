import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DorkLabs',
  description: 'Created with by pr0ff3'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

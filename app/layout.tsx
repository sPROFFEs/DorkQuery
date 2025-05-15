import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DorkLabs',
  description: 'Created with by pr0ff3',
  icons: {
    icon: '/favicon.png',
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
        <link rel="icon" href="/favicon.png" type="image/png" />
        {/* Puedes añadir más variantes si quieres */}
      </head>
      <body>{children}</body>
    </html>
  );
}


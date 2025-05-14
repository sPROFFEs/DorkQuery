import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "@/lib/get-messages"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hacking Ético Interactivo",
  description: "Aprende ciberseguridad a través de desafíos prácticos y minijuegos interactivos",
    generator: 'v0.dev'
}

export async function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }, { locale: "de" }]
}

export default async function RootLayout({
  children,
  params: { locale = "es" },
}: Readonly<{
  children: React.ReactNode
  params: { locale?: string }
}>) {
  const messages = await getMessages(locale)

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

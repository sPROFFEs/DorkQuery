import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../../globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "@/lib/get-messages"
import { TranslationProvider } from "@/contexts/translation-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hacking Ético Interactivo",
  description: "Aprende ciberseguridad a través de desafíos prácticos y minijuegos interactivos",
}

export async function generateStaticParams() {
  return [{ locale: "es" }, { locale: "en" }, { locale: "de" }]
}

export default async function RootLayout({
  children,
  params: { locale = "es" },
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  const messages = await getMessages(locale)

  return (
    <html lang={locale}>
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <TranslationProvider>
              <Navbar />
              <main>{children}</main>
            </TranslationProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

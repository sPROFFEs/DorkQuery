"use client"

import Link from "next/link"
import { useState } from "react"
import { Shield, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import LanguageSwitcher from "@/components/language-switcher"
import { useTranslations } from "next-intl"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations("nav")

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Extraer el locale de la URL
  const locale = pathname.split("/")[1] || "es"

  const navLinks = [
    { name: t("home"), href: `/${locale}` },
    { name: t("challenges"), href: `/${locale}/ctf` },
    { name: t("courses"), href: `/${locale}/curso` },
    { name: t("about"), href: `/${locale}/about` },
  ]

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-green-500" />
            <span className="font-bold text-xl text-white">HackingLab</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-green-500 ${
                  pathname === link.href ? "text-green-500" : "text-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block text-sm font-medium transition-colors hover:text-green-500 ${
                  pathname === link.href ? "text-green-500" : "text-gray-300"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Check, ChevronDown, Globe, Settings, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useTranslations } from "next-intl"
import { useTranslation } from "@/contexts/translation-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const languages = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations("nav")
  const { translationMode, setTranslationMode, autoDetectLanguage, setAutoDetectLanguage } = useTranslation()

  // Determinar el idioma actual desde la URL
  const currentLocale = pathname.split("/")[1] || "es"
  const [isOpen, setIsOpen] = useState(false)

  const switchLanguage = (locale: string) => {
    // Construir la nueva URL con el idioma seleccionado
    const newPathname = pathname.replace(/^\/(es|en|de)/, "")
    const newPath = `/${locale}${newPathname}`
    router.push(newPath)
    setIsOpen(false)

    // Save user preference
    localStorage.setItem("preferredLanguage", locale)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-300 hover:text-green-500">
          <Globe className="h-4 w-4" />
          <span className="hidden md:inline">{t("language")}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={`flex items-center justify-between ${
              currentLocale === language.code ? "text-green-500" : "text-gray-300"
            } hover:text-green-500 cursor-pointer`}
            onClick={() => switchLanguage(language.code)}
          >
            {language.name}
            {currentLocale === language.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="bg-gray-800" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="text-gray-300 hover:text-green-500">
            <Settings className="h-4 w-4 mr-2" />
            <span>Translation Settings</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="bg-gray-900 border-gray-800">
            <DropdownMenuCheckboxItem
              checked={translationMode === "auto"}
              onCheckedChange={() => setTranslationMode("auto")}
              className="text-gray-300 hover:text-green-500"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Auto Translation
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={translationMode === "manual"}
              onCheckedChange={() => setTranslationMode("manual")}
              className="text-gray-300 hover:text-green-500"
            >
              <Globe className="h-4 w-4 mr-2" />
              Manual Translation
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator className="bg-gray-800" />

            <div className="px-2 py-1.5 flex items-center">
              <Switch
                id="auto-detect"
                checked={autoDetectLanguage}
                onCheckedChange={setAutoDetectLanguage}
                className="mr-2"
              />
              <Label htmlFor="auto-detect" className="text-sm text-gray-300">
                Auto-detect language
              </Label>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

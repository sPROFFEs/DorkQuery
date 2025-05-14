"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useParams } from "next/navigation"

type TranslationMode = "auto" | "manual"

interface TranslationContextType {
  translationMode: TranslationMode
  setTranslationMode: (mode: TranslationMode) => void
  currentLocale: string
  autoDetectLanguage: boolean
  setAutoDetectLanguage: (detect: boolean) => void
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const locale = (params.locale as string) || "es"
  const [translationMode, setTranslationMode] = useState<TranslationMode>("auto")
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true)

  // Effect to detect browser language on initial load
  useEffect(() => {
    if (autoDetectLanguage && typeof window !== "undefined") {
      // Get browser language
      const browserLang = navigator.language.split("-")[0]

      // Check if browser language is supported and different from current
      if (["es", "en", "de"].includes(browserLang) && browserLang !== locale) {
        // Store user preference
        localStorage.setItem("preferredLanguage", browserLang)

        // Redirect to the detected language
        window.location.href = window.location.href.replace(`/${locale}`, `/${browserLang}`)
      }
    }
  }, [autoDetectLanguage, locale])

  // Effect to load user preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("translationMode") as TranslationMode
      const savedAutoDetect = localStorage.getItem("autoDetectLanguage")

      if (savedMode) {
        setTranslationMode(savedMode)
      }

      if (savedAutoDetect !== null) {
        setAutoDetectLanguage(savedAutoDetect === "true")
      }
    }
  }, [])

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("translationMode", translationMode)
      localStorage.setItem("autoDetectLanguage", String(autoDetectLanguage))
    }
  }, [translationMode, autoDetectLanguage])

  return (
    <TranslationContext.Provider
      value={{
        translationMode,
        setTranslationMode,
        currentLocale: locale,
        autoDetectLanguage,
        setAutoDetectLanguage,
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}

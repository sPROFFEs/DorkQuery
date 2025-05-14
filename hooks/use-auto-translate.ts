"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"

export function useAutoTranslate() {
  const params = useParams()
  const locale = (params.locale as string) || "es"
  const [isTranslating, setIsTranslating] = useState(false)

  const translateText = useCallback(
    async (text: string, sourceLang = "es"): Promise<string> => {
      // Skip translation if already in the target language
      if (locale === sourceLang) {
        return text
      }

      try {
        setIsTranslating(true)
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            targetLang: locale,
            sourceLang,
          }),
        })

        const data = await response.json()
        return data.translatedText || text
      } catch (error) {
        console.error("Translation error:", error)
        return text
      } finally {
        setIsTranslating(false)
      }
    },
    [locale],
  )

  const translateObject = useCallback(
    async <T extends object>(obj: T, sourceLang = "es"): Promise<T> => {
      // Skip translation if already in the target language
      if (locale === sourceLang) {
        return obj
      }

      try {
        setIsTranslating(true)
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: obj,
            targetLang: locale,
            sourceLang,
            isObject: true,
          }),
        })

        const data = await response.json()
        return data.translatedText || obj
      } catch (error) {
        console.error("Translation error:", error)
        return obj
      } finally {
        setIsTranslating(false)
      }
    },
    [locale],
  )

  return {
    translateText,
    translateObject,
    isTranslating,
    currentLocale: locale,
  }
}

"use client"

import { useState, useEffect } from "react"
import { useAutoTranslate } from "@/hooks/use-auto-translate"
import { Loader2 } from "lucide-react"
import type { JSX } from "react"

interface AutoTranslateProps {
  text: string
  sourceLang?: string
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export function AutoTranslate({ text, sourceLang = "es", as: Component = "span", className = "" }: AutoTranslateProps) {
  const { translateText, currentLocale } = useAutoTranslate()
  const [translatedText, setTranslatedText] = useState(text)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Skip translation if the content is already in the target language
    if (currentLocale === sourceLang) {
      setTranslatedText(text)
      return
    }

    setIsLoading(true)
    translateText(text, sourceLang)
      .then((result) => {
        setTranslatedText(result)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [text, translateText, currentLocale, sourceLang])

  const props = {
    className: `${className} ${isLoading ? "opacity-70" : ""}`,
  }

  return (
    <Component {...props}>
      {isLoading && <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />}
      {translatedText}
    </Component>
  )
}

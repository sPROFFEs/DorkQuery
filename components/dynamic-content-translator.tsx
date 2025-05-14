"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAutoTranslate } from "@/hooks/use-auto-translate"
import { useTranslation } from "@/contexts/translation-context"
import { Loader2 } from "lucide-react"

interface DynamicContentTranslatorProps {
  content: any
  sourceLang?: string
  children: (translatedContent: any) => React.ReactNode
}

export function DynamicContentTranslator({ content, sourceLang = "es", children }: DynamicContentTranslatorProps) {
  const { translateObject, currentLocale } = useAutoTranslate()
  const { translationMode } = useTranslation()
  const [translatedContent, setTranslatedContent] = useState(content)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Skip translation if manual mode or already in target language
    if (translationMode === "manual" || currentLocale === sourceLang) {
      setTranslatedContent(content)
      return
    }

    setIsLoading(true)
    translateObject(content, sourceLang)
      .then((result) => {
        setTranslatedContent(result)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [content, translateObject, currentLocale, sourceLang, translationMode])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        <span className="ml-2 text-gray-300">Translating content...</span>
      </div>
    )
  }

  return <>{children(translatedContent)}</>
}

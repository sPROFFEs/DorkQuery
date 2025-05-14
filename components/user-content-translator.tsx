"use client"

import { useState } from "react"
import { useAutoTranslate } from "@/hooks/use-auto-translate"
import { Button } from "@/components/ui/button"
import { Loader2, Globe } from "lucide-react"

interface UserContentTranslatorProps {
  content: string
  sourceLang?: string
  className?: string
}

export function UserContentTranslator({ content, sourceLang = "es", className = "" }: UserContentTranslatorProps) {
  const { translateText, currentLocale } = useAutoTranslate()
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  // Skip if already in the target language
  if (currentLocale === sourceLang) {
    return <div className={className}>{content}</div>
  }

  const handleTranslate = async () => {
    if (isTranslating) return

    setIsTranslating(true)
    try {
      const translated = await translateText(content, sourceLang)
      setTranslatedContent(translated)
    } catch (error) {
      console.error("Translation error:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleRevert = () => {
    setTranslatedContent(null)
  }

  return (
    <div className={className}>
      <div className="mb-2 flex justify-end">
        {translatedContent === null ? (
          <Button variant="outline" size="sm" onClick={handleTranslate} disabled={isTranslating} className="text-xs">
            {isTranslating ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Globe className="mr-1 h-3 w-3" />
                Translate
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={handleRevert} className="text-xs">
            Show original
          </Button>
        )}
      </div>
      <div>{translatedContent !== null ? translatedContent : content}</div>
    </div>
  )
}

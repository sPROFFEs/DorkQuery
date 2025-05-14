// Cache to store translations to avoid redundant API calls
type TranslationCache = {
  [key: string]: {
    [targetLang: string]: string
  }
}

const translationCache: TranslationCache = {}

/**
 * Translates text using a translation API
 * @param text Text to translate
 * @param targetLang Target language code (e.g., 'en', 'de')
 * @param sourceLang Source language code (defaults to 'es')
 * @returns Translated text
 */
export async function translateText(text: string, targetLang: string, sourceLang = "es"): Promise<string> {
  // Skip translation if target language is the same as source language
  if (targetLang === sourceLang) {
    return text
  }

  // Check cache first
  if (translationCache[text] && translationCache[text][targetLang]) {
    return translationCache[text][targetLang]
  }

  try {
    // Call translation API
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`,
    )

    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData) {
      const translatedText = data.responseData.translatedText

      // Store in cache
      if (!translationCache[text]) {
        translationCache[text] = {}
      }
      translationCache[text][targetLang] = translatedText

      return translatedText
    } else {
      console.error("Translation error:", data)
      return text // Return original text on error
    }
  } catch (error) {
    console.error("Translation service error:", error)
    return text // Return original text on error
  }
}

/**
 * Batch translate multiple texts at once
 * @param texts Array of texts to translate
 * @param targetLang Target language code
 * @param sourceLang Source language code
 * @returns Array of translated texts
 */
export async function batchTranslate(texts: string[], targetLang: string, sourceLang = "es"): Promise<string[]> {
  return Promise.all(texts.map((text) => translateText(text, targetLang, sourceLang)))
}

/**
 * Translates a nested object of texts
 * @param obj Object with text values to translate
 * @param targetLang Target language code
 * @param sourceLang Source language code
 * @returns Translated object with the same structure
 */
export async function translateObject<T>(obj: T, targetLang: string, sourceLang = "es"): Promise<T> {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  const result: any = Array.isArray(obj) ? [] : {}

  for (const key in obj) {
    const value = obj[key as keyof typeof obj]

    if (typeof value === "string") {
      result[key] = await translateText(value, targetLang, sourceLang)
    } else if (typeof value === "object" && value !== null) {
      result[key] = await translateObject(value, targetLang, sourceLang)
    } else {
      result[key] = value
    }
  }

  return result as T
}

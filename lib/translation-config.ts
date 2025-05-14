// Configuration for the translation service
export const translationConfig = {
  // Supported languages
  supportedLanguages: ["es", "en", "de"],

  // Default language (source language)
  defaultLanguage: "es",

  // Translation API endpoint
  apiEndpoint: "https://api.mymemory.translated.net/get",

  // Cache expiration time in milliseconds (24 hours)
  cacheExpirationTime: 24 * 60 * 60 * 1000,

  // Maximum cache size (number of entries)
  maxCacheSize: 1000,

  // Custom dictionary for technical terms
  customDictionary: {
    es: {
      "inyección SQL": {
        en: "SQL injection",
        de: "SQL-Injektion",
      },
      "cross-site scripting": {
        en: "cross-site scripting",
        de: "Cross-Site-Scripting",
      },
      "hacking ético": {
        en: "ethical hacking",
        de: "ethisches Hacking",
      },
    },
  },
}

// Function to check if a language is supported
export function isLanguageSupported(language: string): boolean {
  return translationConfig.supportedLanguages.includes(language)
}

// Function to get the base URL for GitHub Pages deployment
export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_BASE_PATH || ""
}

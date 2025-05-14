import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { enTranslation } from './locales/en';
import { esTranslation } from './locales/es';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    load: 'languageOnly',
    
    resources: {
      en: {
        translation: enTranslation
      },
      es: {
        translation: esTranslation
      }
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    react: {
      useSuspense: false,
    }
  });

// Function to translate text dynamically (for content not in translation files)
export const translateDynamically = async (text: string, targetLang: string = i18n.language): Promise<string> => {
  // In a real implementation, this would use Google Translate API or similar
  // For this demo, we'll use a simplified mock
  if (targetLang === 'en' || !text) return text;
  
  try {
    // In a real app, this would be an API call to a translation service
    // For demo, we'll return the original text with a prefix
    return `[Translated to ${targetLang}] ${text}`;
    
    // Example of how a real implementation might look:
    // const url = `https://translation-api.example.com/translate?text=${encodeURIComponent(text)}&target=${targetLang}`;
    // const response = await fetch(url);
    // const data = await response.json();
    // return data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
};

export default i18n;
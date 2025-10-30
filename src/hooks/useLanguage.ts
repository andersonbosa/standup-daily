import { useLocalStorage } from './useLocalStorage'
import { getTranslation, type Language, type TranslationKey } from '@/i18n/translations'

export function useLanguage() {
  const [language, setLanguage] = useLocalStorage<Language>('daily-timer-language', 'pt-BR')

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key)
  }

  return {
    language,
    setLanguage,
    t,
  }
}


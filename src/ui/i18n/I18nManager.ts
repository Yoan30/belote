import frTranslations from '../../i18n/fr.js';
import enTranslations from '../../i18n/en.js';

type TranslationKey = string;
type Translations = Record<string, any>;

export class I18nManager {
  private currentLanguage: 'fr' | 'en' = 'fr';
  private translations: Record<string, Translations> = {
    fr: frTranslations,
    en: enTranslations
  };

  async initialize(): Promise<void> {
    // Language is loaded from settings in the future
    this.currentLanguage = 'fr';
  }

  setLanguage(language: 'fr' | 'en'): void {
    this.currentLanguage = language;
  }

  t(key: TranslationKey): string {
    const keys = key.split('.');
    let current: any = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback to key if translation not found
        console.warn(`Translation key '${key}' not found for language '${this.currentLanguage}'`);
        return key;
      }
    }
    
    return typeof current === 'string' ? current : key;
  }

  getCurrentLanguage(): 'fr' | 'en' {
    return this.currentLanguage;
  }

  getAvailableLanguages(): ('fr' | 'en')[] {
    return Object.keys(this.translations) as ('fr' | 'en')[];
  }
}
import { useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

interface Translations {
  [key: string]: any;
}

const loadTranslations = async (language: Language): Promise<Translations> => {
  try {
    const response = await fetch(`/locales/${language}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${language}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading translations:', error);
    // Fallback to English if loading fails
    if (language !== 'en') {
      const fallbackResponse = await fetch('/locales/en.json');
      return await fallbackResponse.json();
    }
    return {};
  }
};

export const useTranslations = (language: Language) => {
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      setLoading(true);
      const newTranslations = await loadTranslations(language);
      setTranslations(newTranslations);
      setLoading(false);
    };

    loadLanguage();
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }

    // Handle parameter substitution
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    return value;
  };

  return { t, loading };
};
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageCode } from '@/i18n/config';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  getLocalizedField: <T extends Record<string, any>>(obj: T, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const [language, setLanguageState] = useState<LanguageCode>(
    (i18n.language as LanguageCode) || 'ru'
  );

  const setLanguage = (lang: LanguageCode) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as LanguageCode | null;
    if (savedLang && ['ru', 'kz', 'en'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const getLocalizedField = <T extends Record<string, any>>(obj: T, field: string): string => {
    const localizedKey = `${field}_${language}`;
    if (obj[localizedKey]) return obj[localizedKey];
    
    // Fallback to Russian, then English
    if (obj[`${field}_ru`]) return obj[`${field}_ru`];
    if (obj[`${field}_en`]) return obj[`${field}_en`];
    
    return obj[field] || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedField }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

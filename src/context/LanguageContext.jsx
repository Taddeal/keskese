import React, { createContext, useState, useEffect, useContext } from 'react';
import enTranslations from '../locales/en.json';
import tiTranslations from '../locales/ti.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem('locale');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLanguage = () => {
    setLocale((prev) => (prev === 'en' ? 'ti' : 'en'));
  };

  const getTranslation = (path, translations) => {
    return path.split('.').reduce((obj, key) => (obj ? obj[key] : null), translations);
  };

  const t = (path, params = {}) => {
    const currentTranslations = locale === 'en' ? enTranslations : tiTranslations;
    let text = getTranslation(path, currentTranslations);

    if (!text) {
      // Fallback to English
      text = getTranslation(path, enTranslations) || path;
    }

    if (text && typeof text === 'string') {
      Object.keys(params).forEach((key) => {
        text = text.replace(new RegExp(`{${key}}`, 'g'), params[key]);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ locale, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

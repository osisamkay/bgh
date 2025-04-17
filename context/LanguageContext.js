import React, { createContext, useState, useContext, useEffect } from 'react';

// Available languages
export const languages = {
  ENGLISH: 'en',
  FRENCH: 'fr',
  SPANISH: 'es',
  CHINESE: 'zh'
};

// Create the context
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Get the language from localStorage or default to English
  const [language, setLanguage] = useState(null);
  
  useEffect(() => {
    // Check for language preference in local storage
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && Object.values(languages).includes(storedLanguage)) {
      setLanguage(storedLanguage);
    } else {
      // If not found, default to browser language or English
      const browserLang = navigator.language.split('-')[0];
      const defaultLang = Object.values(languages).includes(browserLang) 
        ? browserLang 
        : languages.ENGLISH;
      
      setLanguage(defaultLang);
      localStorage.setItem('language', defaultLang);
    }
  }, []);

  // Function to change the language
  const changeLanguage = (lang) => {
    if (Object.values(languages).includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  // Provide language and the change function to children
  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  return useContext(LanguageContext);
};

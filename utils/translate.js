import { languages } from '../contexts/LanguageContext';

// Language display names and configurations
const languageConfig = {
  [languages.ENGLISH]: {
    code: languages.ENGLISH,
    name: 'English',
    flag: '🇺🇸'
  },
  [languages.FRENCH]: {
    code: languages.FRENCH,
    name: 'Français',
    flag: '🇫🇷'
  },
  [languages.SPANISH]: {
    code: languages.SPANISH,
    name: 'Español',
    flag: '🇪🇸'
  },
  [languages.CHINESE]: {
    code: languages.CHINESE,
    name: '中文',
    flag: '🇨🇳'
  }
};

// Get list of available languages with their configurations
export const getAvailableLanguages = () => {
  return Object.values(languageConfig);
};

// Get display name for a language code
export const getLanguageDisplayName = (langCode) => {
  return languageConfig[langCode]?.name || 'English';
};

// Get flag emoji for a language code
export const getLanguageFlag = (langCode) => {
  return languageConfig[langCode]?.flag || '🌐';
};

// Translations object - can be expanded with more translations
export const translations = {
  [languages.ENGLISH]: {
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    search: 'Search',
    // Add more translations as needed
  },
  [languages.FRENCH]: {
    welcome: 'Bienvenue',
    login: 'Connexion',
    register: 'S\'inscrire',
    search: 'Rechercher',
  },
  [languages.SPANISH]: {
    welcome: 'Bienvenido',
    login: 'Iniciar sesión',
    register: 'Registrarse',
    search: 'Buscar',
  },
  [languages.CHINESE]: {
    welcome: '欢迎',
    login: '登录',
    register: '注册',
    search: '搜索',
  }
};

// Get translation for a key in the current language
export const translate = (key, lang = languages.ENGLISH) => {
  return translations[lang]?.[key] || translations[languages.ENGLISH][key] || key;
};

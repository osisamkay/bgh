import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translate } from '../utils/translate';

/**
 * A component to display translated text based on the current language
 * 
 * @param {Object} props - Component props
 * @param {string} props.textKey - The key for the text to translate
 * @param {Object} props.params - Optional parameters for text interpolation
 * @param {string} props.className - Optional CSS class for the text
 * @param {string} props.component - The HTML element to render (default: 'span')
 */
const TranslatedText = ({ textKey, params = {}, className = '', component = 'span', ...rest }) => {
  const { language } = useLanguage();
  
  if (!language) {
    return null; // Don't render until language is loaded
  }
  
  const translatedText = translate(textKey, language, params);
  
  // Render the specified component with the translated text
  const Component = component;
  
  return (
    <Component className={className} {...rest}>
      {translatedText}
    </Component>
  );
};

export default TranslatedText;

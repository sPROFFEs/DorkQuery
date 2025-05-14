import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' }
  ];
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setDropdownOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Globe size={20} className="mr-2" />
        <span>{languages.find(lang => lang.code === i18n.language)?.name || 'Language'}</span>
      </button>
      
      {dropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg p-1 z-20"
          onMouseLeave={() => setDropdownOpen(false)}
        >
          {languages.map(language => (
            <button
              key={language.code}
              className={`block w-full text-left px-4 py-2 rounded-md ${
                i18n.language === language.code 
                  ? 'bg-gray-700 text-green-400' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => changeLanguage(language.code)}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
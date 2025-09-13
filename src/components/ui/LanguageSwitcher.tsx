import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all duration-200 text-white"
      title={t('language.switch')}
    >
      <Globe size={16} />
      <span className="font-medium">
        {language === 'en' ? t('language.chinese') : t('language.english')}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
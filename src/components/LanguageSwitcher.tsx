import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLanguageSwitch = (newLang: 'cs' | 'en') => {
    setLanguage(newLang);

    if (newLang === 'en') {
      navigate('/en/moving-services');
    } else {
      if (location.pathname.startsWith('/en/')) {
        navigate('/');
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-green-600 rounded-lg p-1">
      <Globe className="w-4 h-4 text-white ml-2" />
      <button
        onClick={() => handleLanguageSwitch('cs')}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
          language === 'cs'
            ? 'bg-green-800 text-white shadow-sm'
            : 'text-green-100 hover:text-white'
        }`}
        aria-label="Switch to Czech"
      >
        CZ
      </button>
      <button
        onClick={() => handleLanguageSwitch('en')}
        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
          language === 'en'
            ? 'bg-green-800 text-white shadow-sm'
            : 'text-green-100 hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}

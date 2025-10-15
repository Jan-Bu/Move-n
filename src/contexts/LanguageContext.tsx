import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'cs' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  cs: {
    'nav.home': 'Domů',
    'nav.services': 'Služby',
    'nav.about': 'O nás',
    'nav.reviews': 'Recenze',
    'nav.contact': 'Kontakt',
    'hero.title': 'Profesionální Stěhování',
    'hero.subtitle': 'S MOVE-N',
    'hero.description': 'Rychlé, spolehlivé a bezpečné stěhovací služby pro váš domov nebo firmu',
    'hero.cta.quote': 'Nezávazná Poptávka',
    'hero.cta.services': 'Naše Služby',
    'footer.rights': 'Všechna práva vyhrazena',
    'contact.title': 'Kontaktujte Nás',
    'contact.phone': 'Telefon',
    'contact.email': 'Email',
    'contact.address': 'Adresa'
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.reviews': 'Reviews',
    'nav.contact': 'Contact',
    'hero.title': 'Professional Moving Services',
    'hero.subtitle': 'With MOVE-N',
    'hero.description': 'Fast, reliable and safe moving services for your home or business',
    'hero.cta.quote': 'Get a Free Quote',
    'hero.cta.services': 'Our Services',
    'footer.rights': 'All rights reserved',
    'contact.title': 'Contact Us',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.address': 'Address'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'cs') ? saved : 'cs';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['cs']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

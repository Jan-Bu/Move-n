import { useState, useEffect } from 'react';
import { Menu, X, Truck } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../contexts/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#sluzby', label: t('nav.services') },
    { href: '#o-nas', label: t('nav.about') },
    { href: '#recenze', label: t('nav.reviews') },
    { href: '#kontakt', label: t('nav.contact') },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="/" className="flex items-center space-x-2 group">
            <Truck
              className={`h-8 w-8 transition-colors ${
                isScrolled ? 'text-green-800' : 'text-green-600'
              } group-hover:text-green-800`}
            />
            <span
              className={`text-2xl font-bold transition-colors ${
                isScrolled ? 'text-green-800' : 'text-green-600'
              } group-hover:text-green-800`}
            >
              MOVE-N Moving with heart
            </span>
          </a>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-lg font-medium transition-colors hover:text-green-800 ${
                  isScrolled ? 'text-gray-700' : 'text-green-600'
                }`}
              >
                {link.label}
              </a>
            ))}
            <LanguageSwitcher />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden transition-colors ${
              isScrolled ? 'text-green-800' : 'text-green-600 hover:text-green-800'
            }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-lg animate-slide-up">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-green-600 hover:bg-green-50 hover:text-green-800 rounded-lg transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 py-3">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

import { Facebook, Instagram, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FooterProps {
  lang?: 'cs' | 'en';
}

const translations = {
  cs: {
    description: 'Profesionální stěhovací služby s důrazem na kvalitu, spolehlivost a spokojenost zákazníka.',
    quickLinks: 'Rychlé odkazy',
    services: 'Služby',
    about: 'O nás',
    reviews: 'Recenze',
    contact: 'Kontakt',
    contactTitle: 'Kontakt',
    followUs: 'Sledujte nás',
    businessHours: 'Provozní doba:',
    monFri: 'Po - Pá: 7:00 - 19:00',
    satSun: 'So - Ne: 8:00 - 16:00',
    rights: 'Všechna práva vyhrazena.',
    privacy: 'Ochrana osobních údajů',
    terms: 'Obchodní podmínky'
  },
  en: {
    description: 'Professional moving services with emphasis on quality, reliability and customer satisfaction.',
    quickLinks: 'Quick Links',
    services: 'Services',
    about: 'About',
    reviews: 'Reviews',
    contact: 'Contact',
    contactTitle: 'Contact',
    followUs: 'Follow Us',
    businessHours: 'Business Hours:',
    monFri: 'Mon - Fri: 7:00 AM - 7:00 PM',
    satSun: 'Sat - Sun: 8:00 AM - 4:00 PM',
    rights: 'All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms & Conditions'
  }
};

export default function Footer({ lang = 'cs' }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const t = translations[lang];

  return (
    <footer className="text-gray-900 bg-gradient-to-b from-white to-green-50" style={{ fontSize: '110%' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/logo.PNG"
                alt="MOVI-N Logo"
                className="h-20 w-auto"
              />
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t.description}
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#sluzby" className="text-gray-700 hover:text-primary transition-colors">
                  {t.services}
                </a>
              </li>
              <li>
                <a href="#o-nas" className="text-gray-700 hover:text-primary transition-colors">
                  {t.about}
                </a>
              </li>
              <li>
                <a href="#recenze" className="text-gray-700 hover:text-primary transition-colors">
                  {t.reviews}
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-gray-700 hover:text-primary transition-colors">
                  {t.contact}
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">{t.contactTitle}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+420777535749" className="text-gray-700 hover:text-primary transition-colors">
                  +420 777 535 749
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:khaled.rami1990@gmail.com" className="text-gray-700 hover:text-primary transition-colors">
                  khaled.rami1990@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-semibold mb-4">{t.followUs}</h3>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a
                href="#"
                className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-gray-700 text-sm">
                <strong>{t.businessHours}</strong>
                <br />
                {t.monFri}
                <br />
                {t.satSun}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
            <p className="text-gray-600 text-sm">
              © {currentYear} MOVI-N. {t.rights}
            </p>

            <a
              href="https://bitsbytes.cz/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <img
                src="/MadeBy.webp"
                alt="Made by BitBytes"
                className="h-9 w-auto"
              />
            </a>

            <div className="flex space-x-6 justify-center">
              <Link to="/gdpr" className="text-gray-600 hover:text-primary text-sm transition-colors">
                {t.privacy}
              </Link>
              <Link to="/obchodni-podminky" className="text-gray-600 hover:text-primary text-sm transition-colors">
                {t.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Truck, Facebook, Instagram, Mail, Phone } from 'lucide-react';

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
    <footer className="text-white" style={{ background: '#234542' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Truck className="h-8 w-8 text-green-300" />
              <span className="text-2xl font-bold">MOVI-N</span>
            </div>
            <p className="text-green-100 leading-relaxed">
              {t.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#sluzby" className="text-green-100 hover:text-white transition-colors">
                  {t.services}
                </a>
              </li>
              <li>
                <a href="#o-nas" className="text-green-100 hover:text-white transition-colors">
                  {t.about}
                </a>
              </li>
              <li>
                <a href="#recenze" className="text-green-100 hover:text-white transition-colors">
                  {t.reviews}
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-green-100 hover:text-white transition-colors">
                  {t.contact}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.contactTitle}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-300" />
                <a href="tel:+420123456789" className="text-green-100 hover:text-white transition-colors">
                  +420 123 456 789
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-300" />
                <a href="mailto:info@move-n.cz" className="text-green-100 hover:text-white transition-colors">
                  info@move-n.cz
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">{t.followUs}</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-green-800 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-green-100 text-sm">
                <strong>{t.businessHours}</strong>
                <br />
                {t.monFri}
                <br />
                {t.satSun}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-green-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-green-100 text-sm text-center md:text-left">
              © {currentYear} MOVI-N. {t.rights}
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-green-100 hover:text-white text-sm transition-colors">
                {t.privacy}
              </a>
              <a href="#" className="text-green-100 hover:text-white text-sm transition-colors">
                {t.terms}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

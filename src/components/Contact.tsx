import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';

interface ContactProps {
  cityName?: string;
}

export default function Contact({ cityName }: ContactProps = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const contactInfo = [
    {
      icon: Phone,
      title: 'Telefon',
      value: '+420 123 456 789',
      href: 'tel:+420123456789',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'info@move-n.cz',
      href: 'mailto:info@move-n.cz',
    },
    {
      icon: MapPin,
      title: 'Adresa',
      value: 'Praha, Česká republika',
      href: '#',
    },
  ];

  return (
    <section id="kontakt" ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Kontaktujte <span className="text-green-800">Nás</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Máte zájem o naše služby? Vyplňte formulář a my se vám ozveme do 24 hodin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className={isVisible ? 'animate-slide-in-left' : 'opacity-0'}>
            <div className="space-y-8 mb-12">
              {contactInfo.map((info, index) => (
                <a
                  key={index}
                  href={info.href}
                  className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
                >
                  <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-700 transition-colors">
                    <info.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{info.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-gradient-to-br from-green-800 to-green-600 p-8 rounded-xl text-white">
              <h3 className="text-2xl font-bold mb-4">Proč si vybrat MOVI-N?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-3">✓</span>
                  <span>Bezplatná nezávazná konzultace</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">✓</span>
                  <span>Transparentní ceník bez skrytých poplatků</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">✓</span>
                  <span>Pojištění nákladu</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">✓</span>
                  <span>Dostupnost 7 dní v týdnu</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={isVisible ? 'animate-slide-in-right' : 'opacity-0'}>
            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              className="space-y-6"
              onSubmit={() => {
                if (window.gtag && cityName) {
                  window.gtag('event', 'form_submit', {
                    event_category: 'Contact',
                    event_label: 'Contact Form',
                    city: cityName
                  });
                }
              }}
            >
              <input type="hidden" name="form-name" value="contact" />
              {cityName && <input type="hidden" name="city" value={cityName} />}
              <p className="hidden">
                <label>
                  Don't fill this out if you're human: <input name="bot-field" />
                </label>
              </p>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Jméno a příjmení *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Typ služby *
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Vyberte službu</option>
                  <option value="domacnost">Stěhování domácností</option>
                  <option value="firma">Firemní stěhování</option>
                  <option value="baleni">Balení a zabalení</option>
                  <option value="preprava">Přeprava nábytku</option>
                  <option value="express">Express služby</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Zpráva *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Popište nám vaše požadavky..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-green-800 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Odeslat poptávku</span>
                <Send className="h-5 w-5" />
              </button>

              <p className="text-sm text-gray-600 text-center">
                * Povinná pole. Vaše údaje jsou v bezpečí a nebudou sdíleny s třetími stranami.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

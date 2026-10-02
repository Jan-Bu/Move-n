import { useEffect } from 'react';
import { CheckCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface ThankYouPageProps {
  lang?: 'cs' | 'en';
}

const content = {
  cs: {
    title: 'Děkujeme za vaši poptávku',
    description: 'Vaši poptávku jsme úspěšně obdrželi.',
    detail: 'Cenovou nabídku vám pošleme co nejdříve na uvedený e-mail.',
    button: 'Zpět na hlavní stránku',
    seoTitle: 'Děkujeme za poptávku | MOVI-N',
  },
  en: {
    title: 'Thank you for your request',
    description: 'We have successfully received your request.',
    detail: 'We will send a quote to the email address you provided as soon as possible.',
    button: 'Back to the home page',
    seoTitle: 'Thank you for your request | MOVI-N',
  },
};

export default function ThankYouPage({ lang = 'cs' }: ThankYouPageProps) {
  const copy = content[lang];
  const homePath = lang === 'en' ? '/en/moving-services' : '/';

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <SEO title={copy.seoTitle} description={copy.description} />

      <header className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link to={homePath} aria-label={copy.button}>
            <img src="/logo.PNG" alt="MOVI-N" className="h-16 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-green-100 px-6 py-12 sm:px-12 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-600" aria-hidden="true" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{copy.title}</h1>
          <p className="text-xl text-gray-700 mb-2">{copy.description}</p>
          <p className="text-gray-600 mb-8">{copy.detail}</p>
          <Link
            to={homePath}
            className="inline-flex items-center justify-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" aria-hidden="true" />
            {copy.button}
          </Link>
        </section>
      </main>

      <Footer lang={lang} />
    </div>
  );
}

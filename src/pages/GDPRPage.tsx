import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileText, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function GDPRPage() {
  const { language, t } = useLanguage();
  const currentDate = new Date().toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-GB');

  const formatContent = (content: string) => {
    return content.split('|').map((line, idx) => (
      <span key={idx}>
        {line}
        {idx < content.split('|').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-800 to-green-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="inline-flex items-center text-green-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('gdpr.backToHome')}
            </Link>
            <div className="flex items-center space-x-4 mb-4">
              <Shield className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">{t('gdpr.title')}</h1>
            </div>
            <p className="text-green-100 text-lg">
              {t('gdpr.lastUpdated')} {currentDate}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Intro */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <FileText className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.intro.title')}</h2>
                <p className="text-gray-700 leading-relaxed">{t('gdpr.intro.content')}</p>
              </div>
            </div>
          </section>

          {/* Controller */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <User className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.controller.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-1">
                  <p className="font-semibold">{t('gdpr.controller.company')}</p>
                  <p>{t('gdpr.controller.id')}</p>
                  <p>{t('gdpr.controller.address')}</p>
                  <p>E-mail: info@move-n.cz</p>
                  <p>{t('contact.phone')}: +420 123 456 789</p>
                </div>
              </div>
            </div>
          </section>

          {/* Purposes */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('gdpr.purposes.title')}</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('gdpr.purposes.services')}</h3>
                <p className="text-gray-700">{t('gdpr.purposes.services.desc')}</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('gdpr.purposes.quotes')}</h3>
                <p className="text-gray-700">{t('gdpr.purposes.quotes.desc')}</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('gdpr.purposes.invoicing')}</h3>
                <p className="text-gray-700">{t('gdpr.purposes.invoicing.desc')}</p>
              </div>
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('gdpr.purposes.marketing')}</h3>
                <p className="text-gray-700">{t('gdpr.purposes.marketing.desc')}</p>
              </div>
            </div>
          </section>

          {/* Legal Basis */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.legal.title')}</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              {formatContent(t('gdpr.legal.content'))}
            </div>
          </section>

          {/* Retention */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.retention.title')}</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              {formatContent(t('gdpr.retention.content'))}
            </div>
          </section>

          {/* Recipients */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.recipients.title')}</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              {formatContent(t('gdpr.recipients.content'))}
            </div>
          </section>

          {/* Rights */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <Lock className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.rights.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('gdpr.rights.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.security.title')}</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              {formatContent(t('gdpr.security.content'))}
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.cookies.title')}</h2>
            <p className="text-gray-700 leading-relaxed">{t('gdpr.cookies.content')}</p>
          </section>

          {/* Contact */}
          <section className="mb-12 bg-green-50 border-2 border-green-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('gdpr.contact.title')}</h2>
            <div className="text-gray-700 leading-relaxed">
              {formatContent(t('gdpr.contact.content'))}
            </div>
          </section>
        </div>
      </main>

      <Footer lang={language} />
    </div>
  );
}

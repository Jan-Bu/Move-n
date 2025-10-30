import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Building, Package, CreditCard, Users, ShieldCheck, AlertCircle, XCircle, MessageSquare, Lock, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function TermsPage() {
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
              {t('terms.backToHome')}
            </Link>
            <div className="flex items-center space-x-4 mb-4">
              <FileText className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">{t('terms.title')}</h1>
            </div>
            <p className="text-green-100 text-lg">
              {t('terms.lastUpdated')} {currentDate}
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.intro.title')}</h2>
                <p className="text-gray-700 leading-relaxed">{t('terms.intro.content')}</p>
              </div>
            </div>
          </section>

          {/* Provider */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <Building className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.provider.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-1">
                  <p className="font-semibold">{t('terms.provider.company')}</p>
                  <p>{t('terms.provider.id')}</p>
                  <p>{t('terms.provider.address')}</p>
                  <p>E-mail: info@move-n.cz</p>
                  <p>{t('contact.phone')}: +420 123 456 789</p>
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <Package className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.services.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('terms.services.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Order */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.order.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('terms.order.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Price */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <CreditCard className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.price.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('terms.price.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Customer Obligations */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <Users className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.customer.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('terms.customer.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Provider Responsibility */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <ShieldCheck className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.provider.resp.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('terms.provider.resp.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Insurance */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.insurance.title')}</h2>
                <p className="text-gray-700 leading-relaxed">{t('terms.insurance.content')}</p>
              </div>
            </div>
          </section>

          {/* Cancellation */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <XCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.cancellation.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('terms.cancellation.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Complaints */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <MessageSquare className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.complaints.title')}</h2>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  {formatContent(t('terms.complaints.content'))}
                </div>
              </div>
            </div>
          </section>

          {/* Personal Data */}
          <section className="mb-12 bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-start space-x-4">
              <Lock className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.personal.title')}</h2>
                <p className="text-gray-700 leading-relaxed">{t('terms.personal.content')}</p>
              </div>
            </div>
          </section>

          {/* Final Provisions */}
          <section className="mb-12 bg-green-50 border-2 border-green-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('terms.final.title')}</h2>
            <div className="text-gray-700 leading-relaxed space-y-2">
              {formatContent(t('terms.final.content'))}
            </div>
          </section>
        </div>
      </main>

      <Footer lang={language} />
    </div>
  );
}

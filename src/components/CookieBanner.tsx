import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Package, CheckCircle, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CookiePreferences {
  necessary: boolean;
  marketing: boolean;
  timestamp: number;
}

export default function CookieBanner() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const savePreferences = (preferences: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);

    if (preferences.marketing) {
      console.log('Marketing cookies enabled');
    }
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      marketing: true,
      timestamp: Date.now()
    });
  };

  const handleAcceptNecessary = () => {
    savePreferences({
      necessary: true,
      marketing: false,
      timestamp: Date.now()
    });
  };

  const handleSaveCustom = () => {
    savePreferences({
      necessary: true,
      marketing: marketingEnabled,
      timestamp: Date.now()
    });
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={() => !showCustomize && setShowBanner(false)}
      />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-green-600 relative">
            {/* Decorative moving boxes animation */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <div className="moving-box-animation">
                <Package className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {/* Close button */}
            {!showCustomize && (
              <button
                onClick={() => setShowBanner(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {!showCustomize ? (
              /* Main Banner */
              <div className="p-6 md:p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {t('cookie.title')}
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                      {t('cookie.description')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t('cookie.acceptAll')}</span>
                  </button>

                  <button
                    onClick={handleAcceptNecessary}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    {t('cookie.acceptNecessary')}
                  </button>

                  <button
                    onClick={() => setShowCustomize(true)}
                    className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Settings className="w-5 h-5" />
                    <span>{t('cookie.customize')}</span>
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <Link
                    to="/gdpr"
                    className="text-sm text-green-600 hover:text-green-700 underline"
                    onClick={() => setShowBanner(false)}
                  >
                    {t('cookie.learnMore')}
                  </Link>
                </div>
              </div>
            ) : (
              /* Customize Panel */
              <div className="p-6 md:p-8">
                <button
                  onClick={() => setShowCustomize(false)}
                  className="mb-4 text-green-600 hover:text-green-700 flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Zpět</span>
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('cookie.customize')}
                </h2>

                {/* Necessary Cookies */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t('cookie.necessary.title')}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {t('cookie.necessary.description')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-500">Vždy aktivní</span>
                        <div className="w-12 h-6 bg-green-600 rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Package className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t('cookie.marketing.title')}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {t('cookie.marketing.description')}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setMarketingEnabled(!marketingEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 flex items-center ${
                          marketingEnabled ? 'bg-green-600 justify-end' : 'bg-gray-300 justify-start'
                        } px-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-md"></div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={handleSaveCustom}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    {t('cookie.savePreferences')}
                  </button>

                  <button
                    onClick={() => setShowCustomize(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            )}

            {/* Decorative tape effect */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 opacity-60"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes move-box {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-5px) rotate(5deg);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .moving-box-animation {
          animation: move-box 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

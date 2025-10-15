import { useParams, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { cities } from '../data/cities';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Reviews from '../components/Reviews';
import Contact from '../components/Contact';
import Cities from '../components/Cities';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import FAQ from '../components/FAQ';
import NearbyCities from '../components/NearbyCities';
import StructuredData, { getMovingCompanySchema, getFAQSchema } from '../components/StructuredData';

export default function CityPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const location = useLocation();

  const city = cities.find(c => `stehovani-${c.slug}` === citySlug);

  useEffect(() => {
    document.documentElement.lang = 'cs';

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const currentUrl = `${window.location.origin}${location.pathname}`;

    if (canonicalLink) {
      canonicalLink.setAttribute('href', currentUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = currentUrl;
      document.head.appendChild(link);
    }

    const hreflangCS = document.querySelector('link[rel="alternate"][hreflang="cs"]');
    if (hreflangCS) {
      hreflangCS.setAttribute('href', currentUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = 'cs';
      link.href = currentUrl;
      document.head.appendChild(link);
    }

    const hreflangEN = document.querySelector('link[rel="alternate"][hreflang="en"]');
    if (hreflangEN) {
      hreflangEN.setAttribute('href', `${window.location.origin}/en/moving-services`);
    } else {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = 'en';
      link.href = `${window.location.origin}/en/moving-services`;
      document.head.appendChild(link);
    }

    return () => {
      const linkToRemove = document.querySelector('link[rel="canonical"]');
      if (linkToRemove) {
        linkToRemove.remove();
      }
      document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());
    };
  }, [location.pathname]);

  useEffect(() => {
    if (city) {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: city.metaTitle,
          page_location: window.location.href,
          page_path: location.pathname,
          city: city.name
        });
      }
    }
  }, [city, location.pathname]);

  if (!city) {
    return <Navigate to="/" replace />;
  }

  const cityUrl = `${window.location.origin}/stehovani-${city.slug}`;
  const movingCompanySchema = getMovingCompanySchema(city.name, cityUrl);
  const faqSchema = getFAQSchema(city.faq);

  return (
    <div className="min-h-screen bg-white">
      <SEO title={city.metaTitle} description={city.metaDescription} />
      <StructuredData type="MovingCompany" data={movingCompanySchema} />
      <StructuredData type="FAQPage" data={faqSchema} />
      <Navbar />
      <Hero cityName={city.name} />

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Stěhování po celé {city.name}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
              {city.longDescription}
            </p>
          </div>
        </div>
      </section>

      <Services />
      <About />

      <div id="moving-configurator-root" data-lang="cs" data-slug={city.slug} className="my-20"></div>

      <Reviews />
      <FAQ items={city.faq} cityName={city.name} />
      <NearbyCities nearbyCitySlugs={city.nearbyCities} currentCityName={city.name} />
      <Cities />
      <Contact cityName={city.name} />
      <Footer />
    </div>
  );
}

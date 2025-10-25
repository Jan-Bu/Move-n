import { useEffect } from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Reviews from '../components/Reviews';
import Contact from '../components/Contact';
import Cities from '../components/Cities';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function HomePage() {
  useEffect(() => {
    document.documentElement.lang = 'cs';

    const hreflangCS = document.querySelector('link[rel="alternate"][hreflang="cs"]');
    if (hreflangCS) {
      hreflangCS.setAttribute('href', `${window.location.origin}/`);
    } else {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = 'cs';
      link.href = `${window.location.origin}/`;
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
      document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="MOVI-N | Profesionální stěhovací služby v ČR"
        description="MOVI-N nabízí komplexní stěhovací služby po celé České republice. Zkušený tým, moderní vozidla, pojištění nákladu a férové ceny. ✓ Kontaktujte nás pro nezávaznou nabídku."
      />
      <Navbar />
      <Hero />
      <Services />
      <About />

      <div id="moving-configurator-root" data-lang="cs" className="my-20"></div>

      <Reviews />
      <Cities />
      <Contact />
      <Footer />
    </div>
  );
}

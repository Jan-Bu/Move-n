import { useEffect } from 'react';
import { Truck, Package, Shield, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovingAnimation from '../components/MovingAnimation';

export default function EnglishMovingPage() {
  useEffect(() => {
    document.documentElement.lang = 'en';
    document.title = 'Moving Services Across the Czech Republic and Europe | MOVE-N';

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Professional local and international moving company offering reliable transport and packing across Czechia and neighboring countries.');

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const currentUrl = `${window.location.origin}/en/moving-services`;
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
      hreflangEN.setAttribute('href', currentUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = 'en';
      link.href = currentUrl;
      document.head.appendChild(link);
    }

    return () => {
      document.querySelectorAll('link[rel="alternate"]').forEach(altLink => altLink.remove());
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <MovingAnimation />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Moving Services Across the Czech Republic and Beyond
            <span className="block text-[#56A4A0] mt-2">With MOVE-N</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-800 mb-8 max-w-4xl mx-auto animate-slide-up">
            We provide professional moving services not only throughout the Czech Republic but also to neighboring countries such as Germany, Austria, Slovakia, and other countries. Whether you're moving a flat, office, or an entire household, our experienced team will handle everything safely and efficiently.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#56A4A0] rounded-lg hover:bg-[#4a8f8b] transition-all transform hover:scale-105 shadow-xl"
          >
            Get a Free Quote
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive moving solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Local & International Moving</h3>
              <p className="text-gray-700 leading-relaxed">
                From apartments in Prague to villas in Vienna, we handle moves of all sizes across the Czech Republic and to neighboring European countries.
              </p>
            </div>

            <div className="bg-green-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional Packing</h3>
              <p className="text-gray-700 leading-relaxed">
                Our team provides expert packing services using high-quality materials to ensure your belongings arrive safely at their destination.
              </p>
            </div>

            <div className="bg-green-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fully Insured</h3>
              <p className="text-gray-700 leading-relaxed">
                All moves are fully insured, giving you peace of mind that your belongings are protected throughout the journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Cross-Border Moving Services
          </h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Moving across borders doesn't have to be complicated. We specialize in international relocations between the Czech Republic and neighboring countries including Germany, Austria, Slovakia, and other countries. Our experienced team handles all the logistics, customs documentation, and coordination to ensure your move goes smoothly.
            </p>
            <p>
              We offer a full range of vehicle sizes to accommodate everything from small apartment moves to large household relocations. Our modern fleet is equipped with GPS tracking and specialized equipment for securing furniture and fragile items during transport. Every vehicle is regularly inspected and maintained to the highest standards.
            </p>
            <p>
              Insurance coverage is included with every international move, protecting your belongings with insurance. We also provide temporary storage solutions if you need time between moving out and moving in. Our multilingual team can communicate in Czech, English, German, and Slovak to ensure clear communication throughout your move.
            </p>
          </div>
        </div>
      </section>

      <div id="moving-configurator-root" data-lang="en" data-slug="moving-services" className="my-20"></div>

      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get in touch for a free quote or to discuss your moving needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <a href="tel:+420123456789" className="text-lg font-semibold text-gray-900 hover:text-green-600">
                    +420 123 456 789
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <a href="mailto:info@move-n.cz" className="text-lg font-semibold text-gray-900 hover:text-green-600">
                    info@move-n.cz
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-6 bg-green-50 rounded-xl">
                <div className="w-12 h-12 bg-green-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Coverage Area</p>
                  <p className="text-lg font-semibold text-gray-900">
                    Czech Republic & Central Europe
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-800 to-green-600 p-8 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4">Why Choose MOVE-N?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Over 15 years of experience in local and international moving</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Transparent pricing with no hidden fees</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Full insurance coverage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Available 7 days a week including weekends and holidays</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3">✓</span>
                    <span>Multilingual team (Czech, English, Slovak)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <form className="space-y-6 bg-gray-50 p-8 rounded-xl">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
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
                    Phone *
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
                    Service Type *
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a service</option>
                    <option value="residential">Residential Moving</option>
                    <option value="commercial">Commercial Moving</option>
                    <option value="packing">Packing Services</option>
                    <option value="international">International Moving</option>
                    <option value="storage">Storage Solutions</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-800 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us about your moving needs..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-800 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Send Inquiry
                </button>

                <p className="text-sm text-gray-600 text-center">
                  * Required fields. Your data is secure and will not be shared with third parties.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer lang="en" />
    </div>
  );
}

import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'MovingCompany' | 'FAQPage';
  data: Record<string, unknown>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const scriptId = `structured-data-${type}`;
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}

export function getMovingCompanySchema(cityName: string, cityUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: `MOVI-N - Stěhování ${cityName}`,
    url: cityUrl,
    telephone: '+420123456789',
    email: 'info@move-n.cz',
    areaServed: {
      '@type': 'City',
      name: cityName,
      '@id': `https://www.wikidata.org/wiki/${cityName}`
    },
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CZ',
      addressLocality: cityName
    },
    geo: {
      '@type': 'GeoCoordinates',
      addressCountry: 'CZ'
    },
    serviceType: ['Stěhování domácností', 'Firemní stěhování', 'Balení a vyklízení', 'Přeprava nábytku'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127'
    }
  };
}

export function getFAQSchema(faqItems: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

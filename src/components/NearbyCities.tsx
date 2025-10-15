import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { cities } from '../data/cities';

interface NearbyCitiesProps {
  nearbyCitySlugs: string[];
  currentCityName: string;
}

export default function NearbyCities({ nearbyCitySlugs, currentCityName }: NearbyCitiesProps) {
  const nearbyCities = cities.filter(city => nearbyCitySlugs.includes(city.slug));

  if (nearbyCities.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stěhování v okolních městech
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nabízíme profesionální stěhovací služby i v okolí {currentCityName}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {nearbyCities.map((city) => (
            <Link
              key={city.slug}
              to={`/stehovani-${city.slug}`}
              className="group flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-green-200"
            >
              <MapPin className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="text-gray-800 group-hover:text-green-700 font-medium transition-colors">
                {city.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

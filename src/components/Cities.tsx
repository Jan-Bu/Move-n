import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cities } from '../data/cities';

export default function Cities() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Stěhování:
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Poskytujeme profesionální stěhovací služby po celé České republice
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city.slug}
              to={`/stehovani-${city.slug}`}
              className="group flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-green-600"
            >
              <MapPin className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-gray-700 group-hover:text-green-600 font-medium transition-colors">
                {city.name}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            Nenašli jste své město? Kontaktujte nás – naše služby pokrývají celou Českou republiku!
          </p>
        </div>
      </div>
    </section>
  );
}

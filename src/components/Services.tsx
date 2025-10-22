import { useEffect, useRef, useState } from 'react';
import { Home, Building2, Package, Truck, Shield, Clock } from 'lucide-react';

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: Home,
      title: 'Stěhování Domácností',
      description: 'Kompletní stěhování bytů a rodinných domů s profesionálním přístupem',
    },
    {
      icon: Building2,
      title: 'Firemní Stěhování',
      description: 'Efektivní přemístění kanceláří a firemních prostor s minimálními prostoji',
    },
    {
      icon: Package,
      title: 'Balení a Zabalení',
      description: 'Profesionální zabalení vašeho majetku s kvalitními obaly',
    },
    {
      icon: Truck,
      title: 'Demontáž a Montáž Nábytku',
      description: 'Odborná demontáž, přeprava a opětovná montáž vašeho nábytku',
    },
    {
      icon: Shield,
      title: 'Pojištění',
      description: 'Plné pojištění vašeho majetku během celého stěhování',
    },
    {
      icon: Clock,
      title: 'Express Služby',
      description: 'Rychlé stěhování v nouzových situacích a krátkých termínech',
    },
  ];

  return (
    <section id="sluzby" ref={sectionRef} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Naše <span className="text-green-800">Služby</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Poskytujeme komplexní stěhovací služby přizpůsobené vašim potřebám včetně stěhování do zahraničí.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                isVisible ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-800 transition-colors">
                <service.icon className="h-8 w-8 text-green-800" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

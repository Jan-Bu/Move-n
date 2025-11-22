import { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function About() {
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

  const features = [
    'Zkušený a profesionální tým',
    'Moderní vozový park',
    'Pojištění nákladu',
    'Transparentní ceník bez skrytých poplatků',
    'Flexibilní termíny',
    'Individuální přístup ke každému klientovi',
  ];

  return (
    <section id="o-nas" ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={isVisible ? 'animate-slide-in-left' : 'opacity-0'}>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-script">
            <span className="text-green-800">MOVI-N <br></br> Moving with heart</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Jsme profesionální stěhovací firma z České republiky, která nabízí kompletní stěhovací služby s důrazem na kvalitu, pečlivost a lidský přístup.
              Zajišťujeme stěhování bytů, domů i kanceláří, a to nejen v Praze, Hradci Králové a Pardubicích, ale i po celé České republice a v zahraničí.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Víme, že stěhování není jen o přesunu věcí. Je to změna, která si zaslouží klid, pořádek a jistotu, že o vše bude postaráno.
              Proto nabízíme balení a vybalení nábytku, montáž a demontáž, úklid po stěhování i lehké opravy. Postaráme se o vše, co pomůže k hladkému průběhu a vašemu pohodlí.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Stěhujete se?
              My vám zabalíme, rozmontujeme a smontujeme, co je potřeba, opravíme drobnosti ve starém bytě, uklidíme, převezeme a v novém domově zase vše připravíme tak, abyste se mohli rovnou nastěhovat a začít novou kapitolu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-800 flex-shrink-0 mt-1" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={isVisible ? 'animate-slide-in-right' : 'opacity-0'}>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/4569340/pexels-photo-4569340.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Stěhovací tým"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Star, Quote } from 'lucide-react';

export default function Reviews() {
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

  const reviews = [
    {
      name: 'Jana Nováková',
      role: 'Stěhování bytu 3+1',
      rating: 5,
      text: 'Vynikající služby! Tým byl profesionální, rychlý a velmi ohleduplný k našemu nábytku. Stěhování proběhlo bez jediného problému. Mohu jen doporučit!',
    },
    {
      name: 'Petr Svoboda',
      role: 'Firemní stěhování',
      rating: 5,
      text: 'Spolupráce s MOVI-N byla na jedničku. Přestěhovali naši kancelář během víkendu, takže jsme v pondělí mohli normálně pracovat. Skvělá koordinace a profesionalita.',
    },
    {
      name: 'Marie Dvořáková',
      role: 'Stěhování rodinného domu',
      rating: 5,
      text: 'Děkujeme za perfektní servis! Ocenili jsme hlavně individuální přístup a flexibilitu. Vše proběhlo přesně podle plánu a cena odpovídala nabídce.',
    },
    {
      name: 'Martin Černý',
      role: 'Express stěhování',
      rating: 5,
      text: 'Potřeboval jsem rychlé stěhování a MOVI-N mi vyšel maximálně vstříc. I přes krátký termín bylo vše dokonale zorganizované. Profesionální přístup!',
    },
    {
      name: 'Lucie Horáková',
      role: 'Stěhování bytu',
      rating: 5,
      text: 'Jsem nadšená! Pánové byli velmi šikovní, ochotní a hlavně velmi rychlí. Cena byla férová a bez skrytých poplatků. Určitě doporučuji všem.',
    },
    {
      name: 'Tomáš Procházka',
      role: 'Komerční prostor',
      rating: 5,
      text: 'Skvělá komunikace od začátku do konce. Tým přistupoval k našemu vybavení jako k vlastnímu. Vše bylo pojištěné a dorazilo v pořádku. Top služba!',
    },
  ];

  return (
    <section id="recenze" ref={sectionRef} className="py-20 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Co říkají <span className="text-green-800">Naši Zákazníci</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Přečtěte si zkušenosti našich spokojených klientů
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                isVisible ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Quote className="h-10 w-10 text-green-200 mb-4" />

              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed italic">"{review.text}"</p>

              <div className="border-t border-gray-200 pt-4">
                <p className="font-bold text-gray-900">{review.name}</p>
                <p className="text-sm text-gray-500">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

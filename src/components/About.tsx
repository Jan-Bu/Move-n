import { useEffect, useRef, useState } from 'react';
import { CheckCircle, Users, Award, TrendingUp } from 'lucide-react';

function AnimatedNumber({ value, suffix = '', duration = 2000, trigger }: { value: number; suffix?: string; duration?: number; trigger: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);

      setCount(Math.floor(easedProgress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [trigger, value, duration]);

  return <>{count}{suffix}</>;
}

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

  const stats = [
    { icon: Users, value: 2500, suffix: '+', label: 'Spokojených Zákazníků' },
    { icon: Award, value: 15, suffix: '+', label: 'Let Zkušeností' },
    { icon: TrendingUp, value: 98, suffix: '%', label: 'Úspěšnost' },
  ];

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
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
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
              <div className="absolute -bottom-8 -left-8 bg-green-800 text-white p-8 rounded-xl shadow-xl">
                <p className="text-4xl font-bold mb-2">
                  <AnimatedNumber value={2500} suffix="+" trigger={isVisible} />
                </p>
                <p className="text-green-100">Úspěšných Stěhování</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="h-10 w-10 text-green-800 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} trigger={isVisible} />
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight } from 'lucide-react';
import MovingAnimation from './MovingAnimation';

interface HeroProps {
  cityName?: string;
}

export default function Hero({ cityName }: HeroProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        <MovingAnimation />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
          {cityName ? `Profesionální Stěhování v ${cityName}` : 'Profesionální Stěhování'}
          <span className="block text-[#56A4A0] mt-2">S MOVI-N</span>
        </h1>
        <p className="text-xl sm:text-2xl  mb-12 max-w-3xl mx-auto animate-slide-up">
          {cityName
            ? `Rychlé, spolehlivé a bezpečné stěhovací služby v ${cityName} a okolí`
            : 'Rychlé, spolehlivé a bezpečné stěhovací služby pro váš domov nebo firmu'
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
          <a
            href="#moving-configurator-root"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-[#56A4A0] rounded-lg hover:bg-[#4a8f8b] transition-all transform hover:scale-105 shadow-xl"
          >
            Kalkulačka Ceny
            <ArrowRight className="ml-2 h-5 w-5" />
          </a>
          <a
            href="#sluzby"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 border-2 border-[#56A4A0] rounded-lg hover:bg-[#56A4A0] hover:text-white transition-all transform hover:scale-105"
          >
            Naše Služby
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}

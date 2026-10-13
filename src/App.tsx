import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import ScrollToTop from './components/ScrollToTop';
import CookieBanner from './components/CookieBanner';
import HomePage from './pages/HomePage';
import CityPage from './pages/CityPage';
import EnglishMovingPage from './pages/EnglishMovingPage';
import GDPRPage from './pages/GDPRPage';
import TermsPage from './pages/TermsPage';
import ThankYouPage from './pages/ThankYouPage';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <CookieBanner />
        <ChatWidget />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/en/moving-services" element={<EnglishMovingPage />} />
          <Route path="/gdpr" element={<GDPRPage />} />
          <Route path="/obchodni-podminky" element={<TermsPage />} />
          <Route path="/dekujeme" element={<ThankYouPage />} />
          <Route path="/en/thank-you" element={<ThankYouPage lang="en" />} />
          <Route path="/:citySlug" element={<CityPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;

import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage/HomePage';
import AboutPage from './pages/AboutPage/AboutPage';
import ContactPage from './pages/ContactPage/ContactPage';
import FeaturesPage from './pages/FeaturesPage/FeaturesPage';
import PaymentReturnPage from './pages/PaymentReturnPage/PaymentReturnPage';
import PricingPage from './pages/PricingPage/PricingPage';
import PrivacyTermsPage from './pages/PrivacyTermsPage/PrivacyTermsPage';
import SimplePage from './pages/SimplePage/SimplePage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<SimplePage title="FAQ" />} />
        <Route path="/payment/return" element={<PaymentReturnPage />} />
        <Route path="/privacyterms" element={<PrivacyTermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

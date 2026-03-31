import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LandingPage from './LandingPage'
import PrivacyPolicyPage from './PrivacyPolicyPage'
import TermsConditionsPage from './TermsConditionsPage'

function ApplyRedirect() {
  const location = useLocation()
  return <Navigate to={{ pathname: '/', search: location.search, hash: '#apply-section' }} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/apply" element={<ApplyRedirect />} />
      <Route path="/terms-conditions" element={<TermsConditionsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

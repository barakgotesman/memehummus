import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import HomePage from './pages/HomePage'
import GeneratorPage from './pages/GeneratorPage'
import AdminPage from './pages/AdminPage'
import TrendsPage from './pages/TrendsPage'
import SuggestionPage from './pages/SuggestionPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/template/:id" element={<GeneratorPage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/suggest" element={<SuggestionPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

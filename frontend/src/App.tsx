import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/ui/Layout'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
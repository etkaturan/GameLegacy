import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/ui/Layout'
import LandingPage from './pages/LandingPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
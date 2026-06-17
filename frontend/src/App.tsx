import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/ui/Layout'
import LandingPage from './pages/LandingPage'
import DashboardPage from './pages/DashboardPage'
import OverviewPage from './pages/dashboard/OverviewPage'
import GamesPage from './pages/dashboard/GamesPage'
import AchievementsPage from './pages/dashboard/AchievementsPage'
import InventoryPage from './pages/dashboard/InventoryPage'
import SettingsPage from './pages/dashboard/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route index element={<OverviewPage />} />
            <Route path="games" element={<GamesPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
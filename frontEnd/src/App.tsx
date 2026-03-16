import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { LandingPage } from './pages/LandingPage'
import { HistoricalDashboard } from './pages/HistoricalDashboard'
import { RealTimeDashboard } from './pages/RealTimeDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/historical" element={<HistoricalDashboard />} />
          <Route path="/realtime" element={<RealTimeDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

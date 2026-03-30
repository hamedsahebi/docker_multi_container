import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/LandingPage'
import { HistoricalDashboard } from './pages/HistoricalDashboard'
import { RealTimeDashboard } from './pages/RealTimeDashboard'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Navigate to="/realtime" replace />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/historical" 
              element={
                <ProtectedRoute>
                  <HistoricalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/realtime" 
              element={
                <ProtectedRoute>
                  <RealTimeDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

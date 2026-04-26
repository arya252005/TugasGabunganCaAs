import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthPage from '../pages/auth/AuthPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import SensorPage from '../pages/sensor/SensorPage'
import PrediksiPage from '../pages/prediksi/PrediksiPage'
import RiwayatPage from '../pages/riwayat/RiwayatPage'
import NotifikasiPage from '../pages/notifikasi/NotifikasiPage'
import { authService } from '../services/authService'

function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth" replace />
  }
  return children
}

export const router = createBrowserRouter([
  { path: '/',            element: <Navigate to="/auth" replace /> },
  { path: '/auth',        element: <AuthPage /> },
  { path: '/dashboard',   element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
  { path: '/sensor',      element: <ProtectedRoute><SensorPage /></ProtectedRoute> },
  { path: '/prediksi',    element: <ProtectedRoute><PrediksiPage /></ProtectedRoute> },
  { path: '/riwayat',     element: <ProtectedRoute><RiwayatPage /></ProtectedRoute> },
  { path: '/notifikasi',  element: <ProtectedRoute><NotifikasiPage /></ProtectedRoute> },
])
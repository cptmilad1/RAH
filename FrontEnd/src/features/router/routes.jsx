import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from '../login/login'
import Dashboard from '../dashboard/dashboard'
import ProtectedRoute from './protectedRoute'

function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/signup" element={<AuthPage initialMode="signup" />} />
      <Route path="/verify-email" element={<AuthPage initialMode="verify" />} />
      <Route path="/reset-password" element={<AuthPage initialMode="reset" />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default Routers
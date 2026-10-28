import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/authStore'

function ProtectedRoute({ children, allowedRoles = ['user', 'admin', 'driver'] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-state"><span className="loading-spinner" />در حال آماده‌سازی حساب شما...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

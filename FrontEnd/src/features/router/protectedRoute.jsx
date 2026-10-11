import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/authStore'

function ProtectedRoute({ children, allowedRoles = ['user', 'admin', 'driver'] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-state">Loading your account...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

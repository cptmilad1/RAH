import i18n from '../settings/locals/i18n.js'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/authStore'

function ProtectedRoute({ children, allowedRoles = ['user', 'admin', 'driver'] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-state"><span className="loading-spinner" />{i18n.t("در حال آماده‌سازی حساب شما...")}</div>
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

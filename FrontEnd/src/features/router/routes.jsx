import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './protectedRoute'

const LoginPage = lazy(() => import('../login/pages/LoginPage'))
const SignupPage = lazy(() => import('../login/pages/SignupPage'))
const VerifyEmailPage = lazy(() => import('../login/pages/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('../login/pages/ResetPasswordPage'))
const Dashboard = lazy(() => import('../dashboard/dashboard'))
const Post = lazy(()=> import('../post/Post'))
const Profile = lazy(() => import('../profiles/Profile'))
const ProfileEditPage = lazy(() => import('../profiles/ProfileEditPage'))

function Routers() {
  return (
    <Suspense fallback={<div className="loading-state">در حال بارگذاری صفحه...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile/:id/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default Routers
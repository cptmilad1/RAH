import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './protectedRoute'
import Loader from '../loaders/loader1'

const LoginPage = lazy(() => import('../login/pages/LoginPage'))
const SignupPage = lazy(() => import('../login/pages/SignupPage'))
const VerifyEmailPage = lazy(() => import('../login/pages/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('../login/pages/ResetPasswordPage'))
const Dashboard = lazy(() => import('../dashboard/dashboard'))
const InboxPage = lazy(() => import('../dashboard/InboxPage'))
const InboxChatPage = lazy(() => import('../dashboard/InboxChatPage'))
const Post = lazy(()=> import('../post/Post'))
const Profile = lazy(() => import('../profiles/Profile'))
const ProfileEditPage = lazy(() => import('../profiles/ProfileEditPage'))
const ShipmentPage = lazy(() => import('../shipments/ShipmentPage'))
const ShipmentDetailsPage = lazy(() => import('../shipments/ShipmentDetailsPage'))
const DriverPanelPage = lazy(() => import('../driver/DriverPanelPage'))
const DriverApplicationPage = lazy(() => import('../driver/DriverApplicationPage'))
const AdminPanelPage = lazy(() => import('../admin/AdminPanelPage'))

function Routers() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile/:id/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}/>
        <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
        <Route path="/inbox/:trackingCode" element={<ProtectedRoute><InboxChatPage /></ProtectedRoute>} />
        <Route path="/post" element={<ProtectedRoute><Post /></ProtectedRoute>}/>
        <Route path="/shipments" element={<ProtectedRoute><ShipmentPage /></ProtectedRoute>} />
        <Route path="/shipments/:trackingCode" element={<ProtectedRoute><ShipmentDetailsPage /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}><DriverPanelPage /></ProtectedRoute>} />
        <Route path="/driver-application" element={<ProtectedRoute allowedRoles={['user']}><DriverApplicationPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPanelPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default Routers
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './protectedRoute'
import Loader from '../loaders/loader1'
import Layout from '../layout/layout'

const LoginPage = lazy(() => import('../login/pages/LoginPage'))
const SignupPage = lazy(() => import('../login/pages/SignupPage'))
const VerifyEmailPage = lazy(() => import('../login/pages/VerifyEmailPage'))
const ResetPasswordPage = lazy(() => import('../login/pages/ResetPasswordPage'))
const Dashboard = lazy(() => import('../dashboard/dashboard'))
const AboutPage = lazy(() => import('../dashboard/pages/AboutPage'))
const HelpPage = lazy(() => import('../dashboard/pages/HelpPage'))
const InboxPage = lazy(() => import('../dashboard/pages/InboxPage'))
const InboxChatPage = lazy(() => import('../dashboard/pages/InboxChatPage'))
const MessagesPage = lazy(() => import('../messages/pages/MessagesPage'))
const DirectMessagePage = lazy(() => import('../messages/DirectMessagePage'))
const Profile = lazy(() => import('../profiles/Profile'))
const ProfileEditPage = lazy(() => import('../profiles/pages/ProfileEditPage'))
const ShipmentPage = lazy(() => import('../shipments/ShipmentPage'))
const ShipmentDetailsPage = lazy(() => import('../shipments/pages/ShipmentDetailsPage'))
const DriverPanelPage = lazy(() => import('../driver/DriverPanelPage'))
const DriverApplicationPage = lazy(() => import('../driver/pages/DriverApplicationPage'))
const AdminPanelPage = lazy(() => import('../admin/AdminPanelPage'))
const SettingsPage = lazy(() => import('../settings/pages/SettingsPage'))

const rahRoutes = [
  {path : "/login", element:<LoginPage/>, layout : false},
  {path: '/signup', element:<SignupPage/>, layout : false},
  {path: '/verify-email', element:<VerifyEmailPage/>, layout : false},
  {path: '/reset-password', element:<ResetPasswordPage/>, layout : false},
  {path: '/profile/:id/edit', element:<ProtectedRoute><ProfileEditPage/></ProtectedRoute>, layout : true},
  {path: '/profile/:id', element:<ProtectedRoute><Profile/></ProtectedRoute>, layout : true},
  {path: '/dashboard', element:<ProtectedRoute><Dashboard/></ProtectedRoute>, layout : true},
  {path: '/settings', element:<ProtectedRoute><SettingsPage/></ProtectedRoute>, layout : true},
  {path: '/about', element:<ProtectedRoute><AboutPage/></ProtectedRoute>, layout : false},
  {path: '/help', element:<ProtectedRoute><HelpPage/></ProtectedRoute>, layout : true},
  {path: '/inbox', element:<ProtectedRoute><InboxPage/></ProtectedRoute>, layout : true},
  {path: '/inbox/:trackingCode', element:<ProtectedRoute><InboxChatPage/></ProtectedRoute>, layout : true},
  {path: '/messages', element:<ProtectedRoute><MessagesPage/></ProtectedRoute>, layout : true},
  {path: '/messages/:userId', element:<ProtectedRoute><DirectMessagePage/></ProtectedRoute>, layout : true},
  {path: '/shipments', element:<ProtectedRoute><ShipmentPage/></ProtectedRoute>, layout : true},
  {path: '/shipments/:trackingCode', element:<ProtectedRoute><ShipmentDetailsPage/></ProtectedRoute>, layout : true},
  {path: '/driver', element: <ProtectedRoute allowedRoles={['driver']}><DriverPanelPage/></ProtectedRoute>, layout : true},
  {path: '/driver-application', element: <ProtectedRoute allowedRoles={['user']}><DriverApplicationPage/></ProtectedRoute>, layout : true},
  {path: '/admin', element: <ProtectedRoute allowedRoles={['admin']}><AdminPanelPage/></ProtectedRoute>, layout : true},
  {path: '*', element: <Navigate to="/dashboard" replace />, layout : true},
  {path: '/', element: <Navigate to="/login" replace />, layout : false}
]


function Routers() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {rahRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.layout ? <Layout>{route.element}</Layout> : route.element}/>
        ))}
      </Routes>
    </Suspense>
  )
}

export default Routers
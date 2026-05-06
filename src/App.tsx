import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Layout from './components/shared/Layout'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { PageLoader } from './components/shared'

// ── Lazy-loaded pages (code splitting) ───────────────────────────────────────
const LoginPage       = lazy(() => import('./pages/auth').then(m => ({ default: m.LoginPage })))
const RegisterPage    = lazy(() => import('./pages/auth').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/extra').then(m => ({ default: m.ForgotPasswordPage })))
const NotFoundPage    = lazy(() => import('./pages/extra').then(m => ({ default: m.NotFoundPage })))

const UserDashboard   = lazy(() => import('./pages/user').then(m => ({ default: m.UserDashboard })))
const FacilitiesPage  = lazy(() => import('./pages/user').then(m => ({ default: m.FacilitiesPage })))
const BookingFormPage = lazy(() => import('./pages/user').then(m => ({ default: m.BookingFormPage })))
const MyBookingsPage  = lazy(() => import('./pages/user').then(m => ({ default: m.MyBookingsPage })))
const CheckoutPage    = lazy(() => import('./pages/user').then(m => ({ default: m.CheckoutPage })))
const NotificationsPage = lazy(() => import('./pages/user').then(m => ({ default: m.NotificationsPage })))
const ProfilePage     = lazy(() => import('./pages/user').then(m => ({ default: m.ProfilePage })))

const AdminDashboard  = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminDashboard })))
const AdminBookings   = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminBookings })))
const AdminFacilities = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminFacilities })))
const AdminUsers      = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminUsers })))
const AdminReports    = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminReports })))

// ── QueryClient ───────────────────────────────────────────────────────────────
const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    }
  }
})

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/login" replace />
  if (admin && user.role !== 'Admin') return <Navigate to="/dashboard" replace />
  return <Layout>{children}</Layout>
}

// ── Animated Route Wrapper ────────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-enter">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          {/* Public */}
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
          <Route path="/"                 element={<Navigate to="/login" replace />} />

          {/* User */}
          <Route path="/dashboard"              element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/facilities"             element={<ProtectedRoute><FacilitiesPage /></ProtectedRoute>} />
          <Route path="/facilities/:id/book"    element={<ProtectedRoute><BookingFormPage /></ProtectedRoute>} />
          <Route path="/bookings"               element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
          <Route path="/checkout/:bookingId"    element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/notifications"          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile"                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"                  element={<ProtectedRoute admin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/bookings"         element={<ProtectedRoute admin><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/facilities"       element={<ProtectedRoute admin><AdminFacilities /></ProtectedRoute>} />
          <Route path="/admin/users"            element={<ProtectedRoute admin><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/reports"          element={<ProtectedRoute admin><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/notifications"    element={<ProtectedRoute admin><NotificationsPage /></ProtectedRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <AnimatedRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#0a0a0f',
                color: '#e8e8f0',
                border: '1px solid rgba(77,155,255,0.2)',
                borderRadius: '0px',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: '700',
              },
              success: { iconTheme: { primary: '#34d399', secondary: '#000' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#000' } },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

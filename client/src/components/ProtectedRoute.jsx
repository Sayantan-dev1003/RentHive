import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to signin
  if (!isAuthenticated()) {
    return <Navigate to="/signin" replace />
  }

  // Check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user?.role === 'customer' ? '/customer/customer-dashboard' : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  // Role-based automatic redirects for better UX
  const isCustomerRoute = location.pathname.startsWith('/customer')
  const isAdminRoute = ['/dashboard', '/products', '/bookings', '/orders', '/reports'].includes(location.pathname)
  
  if (user?.role === 'customer' && isAdminRoute) {
    return <Navigate to="/customer/customer-dashboard" replace />
  }
  
  if (user?.role === 'admin' && isCustomerRoute) {
    return <Navigate to="/dashboard" replace />
  }

  // If authenticated and authorized, render the protected component
  return children
}

export default ProtectedRoute

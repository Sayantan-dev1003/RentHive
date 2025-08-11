import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import CustomerLayout from './components/layout/CustomerLayout'
import { ProtectedRoute } from './components'
import { CartProvider } from './context/CartContext'
import Landing from './Pages/Landing'
import Dashboard from './Pages/Dashboard'
import Products from './Pages/Products'
import Bookings from './Pages/Bookings'
import Orders from './Pages/Orders'
import SignUp from './Pages/SignUp'
import SignIn from './Pages/SignIn'
import Reports from './Pages/Reports'

// Customer Components
import ProductGallery from './customer/Pages/ProductGallery'
import WishlistItems from './customer/Pages/wishlistItems'
import BillingDetails from './customer/Pages/BillingDetails'
import Cart from './customer/Pages/Cart'

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />
        
        {/* Routes without layout (auth pages) */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* Protected admin routes with layout */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Products /></Layout></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Bookings /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Orders /></Layout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={['admin']}><Layout><Reports /></Layout></ProtectedRoute>} />
        
        {/* Protected Customer Routes */}
        <Route path="/customer/customer-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout><ProductGallery /></CustomerLayout></ProtectedRoute>} />
        <Route path="/customer/wishlist" element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout><WishlistItems /></CustomerLayout></ProtectedRoute>} />

        <Route path="/customer/billing-details" element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout><BillingDetails /></CustomerLayout></ProtectedRoute>} />
        <Route path="/customer/cart" element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout><Cart /></CustomerLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
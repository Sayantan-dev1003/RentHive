import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Components/layout/Layout'
import CustomerLayout from './components/layout/CustomerLayout'
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
import OrderRegistered from './customer/Pages/OrderRegistered'

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />
        
        {/* Routes without layout (auth pages) */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* Routes with layout (main app pages) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/bookings" element={<Layout><Bookings /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        
        {/* Customer Routes */}
        <Route path="/customer/customer-dashboard" element={<CustomerLayout><ProductGallery /></CustomerLayout>} />
        <Route path="/customer/wishlist" element={<CustomerLayout><WishlistItems /></CustomerLayout>} />
        <Route path="/customer/order-success" element={<CustomerLayout><OrderRegistered /></CustomerLayout>} />
      </Routes>
    </Router>
  )
}

export default App
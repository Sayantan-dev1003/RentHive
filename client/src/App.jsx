import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Bookings from './pages/Bookings'
import Orders from './pages/Orders'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Reports from './pages/Reports'

function App() {
  return (
  
      <Routes>
        {/* Routes without layout (auth pages) */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* Routes with layout (main app pages) */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/bookings" element={<Layout><Bookings /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
      </Routes>
  
  )
}

export default App
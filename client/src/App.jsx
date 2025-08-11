import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Bookings from './pages/Bookings'
import Orders from './pages/Orders'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Reports from './pages/Reports'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (

      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="flex flex-col h-full w-full">
          {/* Header - Full width */}
          <Header 
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
          
          {/* Content Area with Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Page Sidebar - Below header, collapsible horizontally */}
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
              <Sidebar 
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed}
              />
            </div>
            
            {/* Main content */}
            <div className="flex-1 overflow-auto">
              <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                   <Route path="/signup" element={<SignUp />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
   
  )
}

export default App
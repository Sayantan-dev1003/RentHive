// App.jsx
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './Pages/Dashboard';
import Products from './Pages/Products';
import Bookings from './Pages/Bookings';
import Orders from './Pages/Orders';
import Customers from './Pages/Customers';
import Reports from './Pages/Reports';
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100">
      <Routes>
        {/* Auth routes without dashboard layout */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        
        {/* Dashboard routes with layout */}
        <Route path="/*" element={
          <div className="flex h-full w-full">
            {/* Sidebar */}
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
              <Sidebar
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              {/* Header */}
              <Header
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
              />

              {/* Page content */}
              <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </div>
              </main>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;

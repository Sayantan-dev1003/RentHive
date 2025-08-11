import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import CustomerSidebar from './CustomerSidebar'

const CustomerLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden flex flex-col">
      {/* Header - Full Width */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">RH</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">RentHive</h1>
                  <p className="text-xs text-gray-500">Customer Portal</p>
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <nav className="hidden md:flex space-x-1">
                <a 
                  href="/customer/customer-dashboard" 
                  className={`
                    group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift
                    ${location.pathname === '/customer/customer-dashboard' 
                      ? "bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <span className={`text-base transition-transform duration-300 ${
                    location.pathname === '/customer/customer-dashboard' ? 'animate-bounceIn' : 'group-hover:scale-110'
                  }`}>
                    📊
                  </span>
                  <span className="font-semibold">Dashboard</span>
                  {location.pathname === '/customer/customer-dashboard' && (
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  )}
                </a>
                
                <a 
                  href="/customer/wishlist" 
                  className={`
                    group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift
                    ${location.pathname === '/customer/wishlist' 
                      ? "bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <span className={`text-base transition-transform duration-300 ${
                    location.pathname === '/customer/wishlist' ? 'animate-bounceIn' : 'group-hover:scale-110'
                  }`}>
                    ❤️
                  </span>
                  <span className="font-semibold">Wishlist</span>
                  {location.pathname === '/customer/wishlist' && (
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  )}
                </a>
                
                <a 
                  href="/customer/order-success" 
                  className={`
                    group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift
                    ${location.pathname === '/customer/order-success' 
                      ? "bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <span className={`text-base transition-transform duration-300 ${
                    location.pathname === '/customer/order-success' ? 'animate-bounceIn' : 'group-hover:scale-110'
                  }`}>
                    📋
                  </span>
                  <span className="font-semibold">Orders</span>
                  {location.pathname === '/customer/order-success' && (
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  )}
                </a>
                
                <button 
                  className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  <span className="text-base transition-transform duration-300 group-hover:scale-110">
                    🛒
                  </span>
                  <span className="font-semibold">Rent Now</span>
                </button>
              </nav>
              
              {/* Mobile Menu Button */}
              <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a2 2 0 01-2-2V9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">5</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">Customer</span>
              </div>
            </div>
          </div>
      </header>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <CustomerSidebar 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default CustomerLayout
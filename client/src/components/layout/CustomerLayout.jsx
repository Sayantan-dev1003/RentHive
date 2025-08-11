import { useState, useEffect, useRef } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import CustomerSidebar from './CustomerSidebar'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import Logo2 from '/Logo2.png'

const CustomerLayout = ({ children, showSidebar = false }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const userMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { getCartCount } = useCart()
  const { user, logout } = useAuth()
  
  // Check if current page should show sidebar
  const shouldShowSidebar = showSidebar || location.pathname === '/customer/customer-dashboard'
  
  const handleLogout = () => {
    logout()
    navigate('/signin')
  }
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden flex flex-col">
      {/* Header - Full Width */}
      <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-20 w-full animate-slideInDown">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left - Logo */}
            <div className="flex items-center space-x-3 animate-fadeIn">
              <img src={Logo2} alt="RentHive Logo" className='w-[10rem] h-auto' />
              <div>
                <p className="text-sm text-gray-600 font-medium">Customer Portal</p>
              </div>
            </div>
            
            {/* Center - Navigation Buttons */}
            <nav className="hidden md:flex space-x-1 absolute left-1/2 transform -translate-x-1/2">
                <Link 
                  to="/customer/customer-dashboard" 
                  className={`
                    group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift
                    ${location.pathname === '/customer/customer-dashboard' 
                      ? "bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${
                    location.pathname === '/customer/customer-dashboard' ? 'animate-bounceIn' : 'group-hover:scale-110'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                  </svg>
                  <span className="font-semibold">Dashboard</span>
                  {location.pathname === '/customer/customer-dashboard' && (
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
                
                <Link 
                  to="/customer/wishlist" 
                  className={`
                    group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift
                    ${location.pathname === '/customer/wishlist' 
                      ? "bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${
                    location.pathname === '/customer/wishlist' ? 'animate-bounceIn' : 'group-hover:scale-110'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold">Wishlist</span>
                  {location.pathname === '/customer/wishlist' && (
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
                

            </nav>
            
            {/* Right - Actions & User */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
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
              <Link 
                to="/customer/cart"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">{getCartCount()}</span>
              </Link>
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{user?.name || 'Customer'}</div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-semibold text-gray-900">{user?.name || 'Customer'}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                      <div className="text-xs text-blue-600 font-medium mt-1">Customer Account</div>
                    </div>
                    
                    <Link to="/customer/customer-dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </Link>
                    

                    
                    <Link to="/customer/wishlist" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Wishlist
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            <Link 
              to="/customer/customer-dashboard" 
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                location.pathname === '/customer/customer-dashboard' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link 
              to="/customer/wishlist" 
              onClick={() => setShowMobileMenu(false)}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                location.pathname === '/customer/wishlist' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-medium">Wishlist</span>
            </Link>
            

            
            <Link 
              to="/customer/cart" 
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
              </svg>
              <span className="font-medium">Cart ({getCartCount()})</span>
            </Link>
          </div>
        </div>
      )}

      {/* Content Area with Conditional Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conditional Sidebar - Only show on dashboard */}
        {shouldShowSidebar && (
          <CustomerSidebar 
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />
        )}
        
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${shouldShowSidebar ? 'p-6' : 'p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default CustomerLayout
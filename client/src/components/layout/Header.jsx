import { Bars3Icon, BellIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import logo from '/logo.png'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Products', href: '/products', icon: '📦' },
  { name: 'Bookings', href: '/bookings', icon: '📅' },
  { name: 'Orders', href: '/orders', icon: '📋' },
  { name: 'Customers', href: '/customers', icon: '👥' },
  { name: 'Reports', href: '/reports', icon: '📈' },
]

const Header = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-20 w-full animate-slideInDown">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section - Sidebar Toggle, Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2.5 rounded-xl text-slate-600 hover:text-[#2542ff] hover:bg-blue-50 transition-all duration-300 hover-lift group"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg className="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3 animate-fadeIn">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2542ff] via-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center shadow-lg hover-glow animate-float">
              <img src={logo} alt="RentHive Logo" className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">RENTHIVE</span>
              <div className="text-xs text-slate-600 font-medium hidden sm:block">Rental Management</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift
                    ${isActive 
                      ? "bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white shadow-lg shadow-blue-500/30" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <span className={`text-base transition-transform duration-300 ${
                    isActive ? 'animate-bounceIn' : 'group-hover:scale-110'
                  }`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.name}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full animate-slideInRight">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search products, customers..."
              className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2542ff]/20 focus:border-[#2542ff] transition-all duration-300 hover:bg-white focus:bg-white glass text-sm"
            />
          </div>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all duration-300 hover-lift shadow-lg hover-glow"
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-5 w-5" />
            ) : (
              <Bars3Icon className="h-5 w-5" />
            )}
          </button>



          {/* Notifications */}
          <button className="relative p-2.5 text-slate-600 hover:text-[#2542ff] hover:bg-blue-50 rounded-xl transition-all duration-300 hover-lift group">
            <BellIcon className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg">
              <span className="absolute inset-0 bg-red-400 rounded-full animate-ping"></span>
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              3 new notifications
            </div>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2542ff] via-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center shadow-xl hover-lift hover-glow transition-all duration-300">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
            
            <div className="hidden md:block animate-fadeIn">
              <p className="text-sm font-bold text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500 font-medium">admin@renthive.com</p>
            </div>

            {/* Dropdown arrow */}
            <div className="hidden lg:block text-slate-400 group-hover:text-slate-600 transition-colors duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="bg-white border-t border-gray-200/50 shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover-lift
                    ${isActive 
                      ? "bg-gradient-to-r from-[#2542ff] to-[#3b82f6] text-white shadow-lg" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <span className={`text-base ${isActive ? 'animate-bounceIn' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              )
            })}
          </nav>
          
          {/* Mobile Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search products, customers..."
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2542ff]/20 focus:border-[#2542ff] transition-all duration-300 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 
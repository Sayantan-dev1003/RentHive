import { Bars3Icon, BellIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import Logo2 from '/Logo2.png'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Products', href: '/products' },
  { name: 'Bookings', href: '/bookings' },
  { name: 'Orders', href: '/orders' },
  { name: 'Pickup Slots', href: '/pickup-slots' },
  { name: 'Reports', href: '/reports' },
]

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-20 w-full animate-slideInDown">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left section - Sidebar Toggle, Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Sidebar Toggle Button */}
          

          {/* Logo */}
          <div className="flex items-center space-x-3 animate-fadeIn">
            <img src={Logo2} alt="" className='w-[6rem] h-auto' />
            {/* <div>
              <span className="text-xl font-bold gradient-text">RENTHIVE</span>
            </div> */}
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
          <div className="relative" ref={dropdownRef}>
            <div 
              className="flex items-center space-x-3 group cursor-pointer"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2542ff] via-[#3b82f6] to-[#1e40af] rounded-xl flex items-center justify-center shadow-xl hover-lift hover-glow transition-all duration-300">
                  <span className="text-white text-sm font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              
              <div className="hidden md:block animate-fadeIn">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 font-medium">{user?.email || 'user@example.com'}</p>
              </div>

              {/* Dropdown arrow */}
              <div className="hidden lg:block text-slate-400 group-hover:text-slate-600 transition-colors duration-300">
                <svg className={`w-4 h-4 transition-transform duration-300 ${showUserDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
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

          {/* Mobile User Actions */}
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2542ff] via-[#3b82f6] to-[#1e40af] rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 
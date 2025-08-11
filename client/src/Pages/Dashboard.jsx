import { useEffect, useState } from 'react'

const Dashboard = () => {
  const [animateStats, setAnimateStats] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [viewMode, setViewMode] = useState('Card')

  // Mock data for rental products
  const rentalProducts = [
    {
      id: 1,
      name: 'TA 2173 XRQ',
      brand: 'Tata Ace',
      category: 'Medium',
      status: 'Active',
      performance: '90%',
      performanceType: 'Good Performance',
      image: '🚛',
      bgGradient: 'from-blue-600 to-purple-600',
      highlight: 'Chandan Bishoyi'
    },
    {
      id: 2,
      name: 'MJ 3928 XRS',
      brand: 'Mahindra Jeeto',
      category: 'Medium',
      status: 'Idle',
      performance: '50%',
      performanceType: 'Bad Performance',
      image: '🚛',
      bgGradient: 'from-indigo-600 to-blue-600'
    },
    {
      id: 3,
      name: 'BMC 5568 XRW',
      brand: 'Bajaj Maxima',
      category: 'Medium',
      status: 'Idle',
      performance: '0%',
      performanceType: 'Bad Performance',
      image: '🚛',
      bgGradient: 'from-purple-600 to-indigo-600'
    },
    {
      id: 4,
      name: 'MJ 3928 XRS',
      brand: 'Mahindra Jeeto',
      category: 'Medium',
      status: 'Idle',
      performance: '50%',
      performanceType: 'Bad Performance',
      image: '🚛',
      bgGradient: 'from-blue-700 to-purple-700'
    },
    {
      id: 5,
      name: 'TA 2173 XRQ',
      brand: 'Tata Ace',
      category: 'Medium',
      status: 'Active',
      performance: '90%',
      performanceType: 'Good Performance',
      image: '🚛',
      bgGradient: 'from-green-600 to-blue-600'
    },
    {
      id: 6,
      name: 'MJ 3928 XRS',
      brand: 'Mahindra Jeeto',
      category: 'Medium',
      status: 'Idle',
      performance: '50%',
      performanceType: 'Bad Performance',
      image: '🚛',
      bgGradient: 'from-indigo-600 to-purple-600'
    },
    {
      id: 7,
      name: 'BMC 5568 XRW',
      brand: 'Bajaj Maxima',
      category: 'Medium',
      status: 'Maintenance',
      performance: '0%',
      performanceType: 'Bad Performance',
      image: '🚛',
      bgGradient: 'from-orange-600 to-red-600'
    },
    {
      id: 8,
      name: 'MJ 3928 XRS',
      brand: 'Mahindra Jeeto',
      category: 'Medium',
      status: 'Idle',
      performance: '50%',
      performanceType: 'Bad Performance',
      image: '🚛',
      bgGradient: 'from-purple-700 to-indigo-700'
    }
  ]

  const rentalStatusData = [
    { label: 'Reserved', count: 16, color: 'bg-green-500' },
    { label: 'Quotation', count: 1, color: 'bg-orange-500' }
  ]

  const invoiceStatusData = [
    { label: 'Fully Invoice', count: 16, color: 'bg-blue-500' },
    { label: 'Partly to Issue', count: 3, color: 'bg-purple-500' },
    { label: 'To Invoice', count: 8, color: 'bg-gray-500' }
  ]

  const pickupReturnData = [
    { label: 'Picked Up', count: 4, color: 'bg-green-600' },
    { label: 'Returned', count: 1, color: 'bg-blue-600' }
  ]

  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500'
      case 'Idle':
        return 'bg-gray-500'
      case 'Maintenance':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Orders</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search here..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('Card')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'Card' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Card View
            </button>
            <button
              onClick={() => setViewMode('List')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'List' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              List View
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-72 space-y-6">
          {/* Rental Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rental Status</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {rentalStatusData.map((item, index) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup/Return Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              {pickupReturnData.map((item, index) => (
                <div key={item.label} className={`p-4 rounded-xl text-center text-white ${item.color}`}>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <div className="text-sm opacity-90">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Invoice Status</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {invoiceStatusData.map((item, index) => (
                <div key={item.label} className={`p-3 rounded-xl text-center text-white ${item.color}`}>
                  <div className="text-xl font-bold">{item.count}</div>
                  <div className="text-xs opacity-90">{item.label.split(' ')[0]}</div>
                  <div className="text-xs opacity-90">{item.label.split(' ').slice(1).join(' ')}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <div className="mt-2 text-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
              <span className="text-sm text-gray-600">Maintenance</span>
            </div>
          </div>
        </div>

        {/* Main Content - Product Cards */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentalProducts.map((product, index) => (
              <div
                key={product.id}
                className={`relative bg-gradient-to-br ${product.bgGradient} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift ${
                  animateStats ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(product.status)}`}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    {product.status}
                  </div>
                </div>

                {/* Highlight Banner */}
                {product.highlight && (
                  <div className="absolute top-16 left-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold transform -rotate-12 shadow-lg">
                    <span className="mr-1">⚡</span>
                    {product.highlight}
                  </div>
                )}

                {/* Product Image */}
                <div className="flex justify-center my-8">
                  <div className="text-6xl transform hover:scale-110 transition-transform duration-300">
                    {product.image}
                  </div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-1">{product.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm opacity-90 mb-4">
                    <span>{product.brand}</span>
                    <span>•</span>
                    <span>{product.category}</span>
                  </div>

                  {/* Performance */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="font-semibold">{product.performance}</span>
                    <span>•</span>
                    <span className={`${
                      product.performanceType === 'Good Performance' 
                        ? 'text-green-200' 
                        : 'text-red-200'
                    }`}>
                      {product.performanceType}
                    </span>
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
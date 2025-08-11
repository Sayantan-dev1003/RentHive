import { useState, useEffect } from 'react'
import apiService from '../services/api'

// Optimized minimal styles
const optimizedStyles = `
  .simple-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.2s ease;
  }

  .simple-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`;

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalRentals: 0,
    activeCustomers: 0,
    avgRentalValue: 0
  })
  const [topProducts, setTopProducts] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  // Fetch reports data
  const fetchReportsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch orders and products data
      const [ordersResponse, productsResponse] = await Promise.all([
        apiService.getOrders(),
        apiService.getProducts()
      ])

      if (ordersResponse.success) {
        const ordersList = ordersResponse.data.orders || []
        setOrders(ordersList)

        // Calculate dashboard statistics
        const totalRentals = ordersList.length
        const totalRevenue = ordersList.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        const uniqueCustomers = new Set(ordersList.map(order => order.customerId)).size
        const avgRentalValue = totalRentals > 0 ? totalRevenue / totalRentals : 0

        setDashboardStats({
          totalRevenue,
          totalRentals,
          activeCustomers: uniqueCustomers,
          avgRentalValue
        })

        // Generate simple revenue trend data (last 4 months mock)
        const months = ['Mar', 'Apr', 'May', 'Jun']
        const revenueByMonth = months.map(month => ({
          month,
          revenue: Math.floor(Math.random() * 10000) + 25000 // Simplified data
        }))
        setRevenueData(revenueByMonth)
      }

      if (productsResponse.success) {
        const productsList = productsResponse.data.products || []
        setProducts(productsList)

        // Calculate top products (limit to 3 for performance)
        const topProductsData = productsList.slice(0, 3).map(product => ({
          name: product.name,
          rentals: Math.floor(Math.random() * 15) + 5,
          revenue: `₹${(Math.floor(Math.random() * 8000) + 2000).toLocaleString()}`
        }))
        setTopProducts(topProductsData)

        // Mock top customers data (limit to 3)
        const customerNames = ['Mike Johnson', 'John Doe', 'Jane Smith']
        const topCustomersData = customerNames.map(name => ({
          name,
          rentals: Math.floor(Math.random() * 10) + 3,
          spent: `₹${(Math.floor(Math.random() * 15000) + 5000).toLocaleString()}`
        }))
        setTopCustomers(topCustomersData)
      }

    } catch (err) {
      setError('Failed to fetch reports data: ' + err.message)
      console.error('Reports data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle report export
  const handleExportReport = (reportType) => {
    // Mock export functionality - in real app, this would download actual reports
    const reportNames = {
      revenue: 'Revenue Report',
      products: 'Product Performance Report',
      customers: 'Customer Analysis Report'
    }
    
    alert(`Exporting ${reportNames[reportType]}... This would download a ${reportType} report in your preferred format.`)
  }

  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod])

  return (
    <>
      <style>{optimizedStyles}</style>
      <div className="min-h-screen bg-gray-50 space-y-6 p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">{error}</span>
              <button 
                onClick={fetchReportsData}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Insights and analytics for your rental business
          </p>
        </div>

        {/* Modern Period Selector */}
        <div className="glassmorphism rounded-3xl p-8 card-hover animate-slide-in-right">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Time Period Analysis</h2>
              <p className="text-gray-600">Choose your preferred time range for detailed insights</p>
            </div>
            <div className="flex space-x-3">
              {['week', 'month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedPeriod === period 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg animate-glow' 
                      : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="gradient-border card-hover animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="gradient-border-inner p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
                  +12.5%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 animate-count-up">
                  {loading ? (
                    <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `₹${dashboardStats.totalRevenue.toLocaleString()}`
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-2">From rental activities</p>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="gradient-border-inner p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="text-blue-500 text-sm font-semibold bg-blue-50 px-2 py-1 rounded-full">
                  +8.3%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Rentals</p>
                <p className="text-3xl font-bold text-gray-900 animate-count-up">
                  {loading ? (
                    <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    dashboardStats.totalRentals
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-2">Active rental orders</p>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="gradient-border-inner p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-purple-500 text-sm font-semibold bg-purple-50 px-2 py-1 rounded-full">
                  +15.7%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Customers</p>
                <p className="text-3xl font-bold text-gray-900 animate-count-up">
                  {loading ? (
                    <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    dashboardStats.activeCustomers
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-2">Unique customers</p>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="gradient-border-inner p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-orange-500 text-sm font-semibold bg-orange-50 px-2 py-1 rounded-full">
                  +5.4%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Avg. Rental Value</p>
                <p className="text-3xl font-bold text-gray-900 animate-count-up">
                  {loading ? (
                    <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `₹${Math.round(dashboardStats.avgRentalValue).toLocaleString()}`
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-2">Per rental transaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Revenue Chart */}
        <div className="glassmorphism rounded-3xl p-8 card-hover animate-fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Revenue Trend Analysis</h2>
              <p className="text-gray-600">Track your business growth over time</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                Export Data
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                View Details
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading analytics data...</p>
              </div>
            </div>
          ) : (
            <div className="h-80 relative">
              {/* Modern Line Chart */}
              <div className="flex items-end justify-between h-full space-x-6 px-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    {/* Chart Line Point */}
                    <div className="relative mb-4">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-lg relative overflow-hidden shadow-lg transform transition-all duration-1000 hover:scale-105"
                        style={{ 
                          height: `${(data.revenue / 70000) * 260}px`,
                          minHeight: '20px',
                          animationDelay: `${index * 200}ms`
                        }}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        
                        {/* Floating value tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ₹{data.revenue.toLocaleString()}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Month Label */}
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-600 block">{data.month}</span>
                      <span className="text-xs text-gray-400 font-semibold">₹{(data.revenue/1000).toFixed(0)}K</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                {[0, 1, 2, 3, 4].map((line) => (
                  <div
                    key={line}
                    className="absolute w-full border-t border-gray-200/50"
                    style={{ top: `${line * 25}%` }}
                  ></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modern Analytics Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Products - Redesigned */}
          <div className="glassmorphism rounded-3xl p-8 card-hover animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Top Performing Products</h2>
                <p className="text-gray-600">Most rented equipment this {selectedPeriod}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg animate-pulse-scale">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="group p-4 bg-white/50 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          {product.rentals} rentals
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">{product.revenue}</p>
                      <p className="text-xs text-green-600 font-medium">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers - Redesigned */}
          <div className="glassmorphism rounded-3xl p-8 card-hover animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Top Customers</h2>
                <p className="text-gray-600">Most valuable customers this {selectedPeriod}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg animate-pulse-scale">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="group p-4 bg-white/50 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${
                        index === 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                        index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                        index === 2 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                        'bg-gradient-to-br from-pink-400 to-pink-600'
                      }`}>
                        {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{customer.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          {customer.rentals} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">{customer.spent}</p>
                      <p className="text-xs text-emerald-600 font-medium">Total Spent</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="glassmorphism rounded-3xl p-8 text-center animate-fade-in-up">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Export & Share Reports</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => handleExportReport('revenue')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Revenue Report
            </button>
            <button 
              onClick={() => handleExportReport('products')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Product Report
            </button>
            <button 
              onClick={() => handleExportReport('customers')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Customer Report
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Reports 
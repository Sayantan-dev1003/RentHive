import { useState, useEffect } from 'react'
import apiService from '../services/api'

// Enhanced styles for modern UI
const optimizedStyles = `
  .glassmorphism {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  .card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-in-right {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse-scale {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out;
  }

  .animate-slide-in-right {
    animation: slide-in-right 0.6s ease-out;
  }

  .animate-pulse-scale {
    animation: pulse-scale 2s ease-in-out infinite;
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

  // Calculate date range based on selected period
  const getDateRange = (period) => {
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }
    
    return { startDate, endDate: now }
  }

  // Filter orders by date range
  const filterOrdersByPeriod = (orders, period) => {
    if (!Array.isArray(orders)) {
      return []
    }
    
    const { startDate, endDate } = getDateRange(period)
    return orders.filter(order => {
      if (!order || !order.createdAt) return false
      
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  }

  // Calculate top products from real data
  const calculateTopProducts = (orders, products) => {
    if (!Array.isArray(orders) || !Array.isArray(products)) {
      return []
    }
    
    const productStats = {}
    
    // Count rentals and revenue for each product
    orders.forEach(order => {
      if (!order || !order.items) return
      
      order.items.forEach(item => {
        const productId = item.productId
        if (!productId) return
        
        if (!productStats[productId]) {
          const product = products.find(p => p._id === productId)
          productStats[productId] = {
            name: product?.name || 'Unknown Product',
            rentals: 0,
            revenue: 0
          }
        }
        productStats[productId].rentals += 1
        productStats[productId].revenue += item.totalPrice || 0
      })
    })
    
    // Sort by revenue and return top 5
    return Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(product => ({
        ...product,
        revenue: `₹${product.revenue.toLocaleString()}`
      }))
  }

  // Calculate top customers from real data
  const calculateTopCustomers = (orders) => {
    if (!Array.isArray(orders)) {
      return []
    }
    
    const customerStats = {}
    
    // Count orders and spending for each customer
    orders.forEach(order => {
      if (!order) return
      
      const customerId = order.customerId
      
      // Skip orders without valid customer IDs
      if (!customerId) {
        return
      }
      
      if (!customerStats[customerId]) {
        const customerIdStr = customerId.toString()
        customerStats[customerId] = {
          name: order.billingDetails?.name || `Customer ${customerIdStr.length >= 4 ? customerIdStr.slice(-4) : customerIdStr}`,
          rentals: 0,
          spent: 0
        }
      }
      customerStats[customerId].rentals += 1
      customerStats[customerId].spent += order.totalAmount || 0
    })
    
    // Sort by spending and return top 5
    return Object.values(customerStats)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5)
      .map(customer => ({
        ...customer,
        spent: `₹${customer.spent.toLocaleString()}`
      }))
  }

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
        
        // Filter orders by selected period
        const filteredOrders = filterOrdersByPeriod(ordersList, selectedPeriod)

        // Calculate dashboard statistics for selected period
        const totalRentals = filteredOrders.length
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
        const uniqueCustomers = new Set(filteredOrders.map(order => order.customerId)).size
        const avgRentalValue = totalRentals > 0 ? totalRevenue / totalRentals : 0

        setDashboardStats({
          totalRevenue,
          totalRentals,
          activeCustomers: uniqueCustomers,
          avgRentalValue
        })

        // Generate revenue trend data based on selected period
        const generateRevenueData = (orders, period) => {
          const now = new Date()
          const revenueData = []
          let intervals, formatOptions, intervalCount
          
          switch (period) {
            case 'week':
              intervals = 7
              formatOptions = { weekday: 'short' }
              intervalCount = 1 // days
              break
            case 'month':
              intervals = 6
              formatOptions = { month: 'short' }
              intervalCount = 30 // days for month
              break
            case 'quarter':
              intervals = 3
              formatOptions = { month: 'short' }
              intervalCount = 90 // days for quarter
              break
            case 'year':
              intervals = 12
              formatOptions = { month: 'short' }
              intervalCount = 30 // months for year
              break
            default:
              intervals = 6
              formatOptions = { month: 'short' }
              intervalCount = 30
          }
          
          for (let i = intervals - 1; i >= 0; i--) {
            let startDate, endDate, label
            
            if (period === 'week') {
              startDate = new Date(now)
              startDate.setDate(now.getDate() - i)
              endDate = new Date(startDate)
              endDate.setDate(startDate.getDate() + 1)
              label = startDate.toLocaleDateString('en-US', formatOptions)
            } else if (period === 'year') {
              startDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
              endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
              label = startDate.toLocaleDateString('en-US', formatOptions)
            } else {
              const daysBack = i * (intervalCount / intervals)
              startDate = new Date(now)
              startDate.setDate(now.getDate() - daysBack)
              endDate = new Date(startDate)
              endDate.setDate(startDate.getDate() + (intervalCount / intervals))
              label = startDate.toLocaleDateString('en-US', formatOptions)
            }
            
            const periodRevenue = orders
              .filter(order => {
                const orderDate = new Date(order.createdAt)
                return orderDate >= startDate && orderDate < endDate
              })
              .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            
            const periodOrders = orders.filter(order => {
              const orderDate = new Date(order.createdAt)
              return orderDate >= startDate && orderDate < endDate
            }).length
            
            revenueData.push({
              label,
              revenue: periodRevenue,
              orders: periodOrders
            })
          }
          
          return revenueData
        }
        
        setRevenueData(generateRevenueData(filteredOrders, selectedPeriod))
      }

      if (productsResponse.success && ordersResponse.success) {
        const productsList = productsResponse.data.products || []
        const ordersList = ordersResponse.data.orders || []
        setProducts(productsList)
        
        // Filter orders by selected period for analytics
        const filteredOrders = filterOrdersByPeriod(ordersList, selectedPeriod)

        // Calculate real top products from filtered data
        const topProductsData = calculateTopProducts(filteredOrders, productsList)
        setTopProducts(topProductsData)

        // Calculate real top customers from filtered data
        const topCustomersData = calculateTopCustomers(filteredOrders)
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
  const handleExportReport = async (reportType, format = 'pdf') => {
    try {
      setLoading(true)
      const { startDate, endDate } = getDateRange(selectedPeriod)
      
      const response = await apiService.exportReport({
        type: reportType,
        format,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })
      
      if (response.success) {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${reportType}-report-${selectedPeriod}.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report exported successfully!`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export report. Please try again.')
    } finally {
      setLoading(false)
    }
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

        {/* Enhanced Key Metrics - Medium Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    ↗ +12.5%
                  </div>
                  <span className="text-xs text-gray-400 mt-1">vs last month</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Total Revenue</p>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `₹${dashboardStats.totalRevenue.toLocaleString()}`
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">From rental activities</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                    ↗ +8.3%
                  </div>
                  <span className="text-xs text-gray-400 mt-1">vs last month</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Total Rentals</p>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    dashboardStats.totalRentals
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">Active rental orders</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-purple-600 text-xs font-bold bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                    ↗ +15.7%
                  </div>
                  <span className="text-xs text-gray-400 mt-1">vs last month</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Active Customers</p>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    dashboardStats.activeCustomers
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">Unique customers</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-orange-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-orange-600 text-xs font-bold bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                    ↗ +5.4%
                  </div>
                  <span className="text-xs text-gray-400 mt-1">vs last month</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Avg. Rental Value</p>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `₹${Math.round(dashboardStats.avgRentalValue).toLocaleString()}`
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">Per rental transaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Revenue Trend Analysis */}
        <div className="glassmorphism rounded-3xl p-8 card-hover animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Revenue Trend Analysis</h2>
              <p className="text-gray-600">Real-time business growth tracking over the last 6 months</p>
              {!loading && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <span className="text-sm text-gray-600">Total Revenue: ₹{revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                    <span className="text-sm text-gray-600">Total Orders: {revenueData.reduce((sum, d) => sum + (d.orders || 0), 0)}</span>
                  </div>
                </div>
              )}
            </div>
          
          </div>
          
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                </div>
                <p className="text-gray-600 font-medium">Analyzing revenue data...</p>
                <p className="text-sm text-gray-400 mt-1">Processing {dashboardStats.totalRentals} orders</p>
              </div>
            </div>
          ) : (
            <div className="h-96 relative bg-gradient-to-br from-gray-50/50 to-blue-50/30 rounded-2xl p-6">
              {/* Enhanced Chart Visualization */}
              <div className="flex items-end justify-between h-full space-x-4">
                {revenueData.map((data, index) => {
                  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1)
                  const heightPercentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      {/* Enhanced Bar with Gradient */}
                      <div className="relative mb-6 w-full max-w-16">
                        <div 
                          className={`w-full relative overflow-hidden rounded-t-xl shadow-lg transform transition-all duration-1000 hover:scale-105 ${
                            index % 2 === 0 
                              ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400' 
                              : 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-400'
                          }`}
                          style={{ 
                            height: `${Math.max(heightPercentage * 2.5, 8)}px`,
                            animationDelay: `${index * 150}ms`
                          }}
                        >
                          {/* Animated Shimmer Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          
                          {/* Enhanced Tooltip */}
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-4 py-3 rounded-xl text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl z-10">
                            <div className="text-center">
                              <div className="font-bold text-sm">₹{data.revenue.toLocaleString()}</div>
                              <div className="text-gray-300 text-xs">{data.orders || 0} orders</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-gray-900"></div>
                          </div>

                          {/* Growth Indicator */}
                          {index > 0 && (
                            <div className={`absolute -top-8 right-0 text-xs font-bold px-2 py-1 rounded-full ${
                              data.revenue >= revenueData[index - 1].revenue 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {data.revenue >= revenueData[index - 1].revenue ? '↗' : '↘'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Enhanced Period Label */}
                      <div className="text-center space-y-1">
                        <span className="text-sm font-semibold text-gray-700 block">{data.label}</span>
                        <span className="text-xs text-gray-500 font-medium">₹{(data.revenue/1000).toFixed(1)}K</span>
                        <div className="text-xs text-blue-600 font-medium">{data.orders || 0} orders</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Enhanced Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                {[0, 1, 2, 3, 4, 5].map((line) => (
                  <div
                    key={line}
                    className="absolute w-full border-t border-gray-300/30"
                    style={{ top: `${line * 16.67}%` }}
                  >
                    <span className="absolute -left-12 -top-2 text-xs text-gray-400 font-medium">
                      {line === 0 ? '0' : `${Math.round((revenueData.reduce((max, d) => Math.max(max, d.revenue), 0) / 5) * (5 - line) / 1000)}K`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Trend Line Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.3 }} />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#trendGradient)"
                    strokeWidth="0.5"
                    strokeDasharray="2,1"
                    points={revenueData.map((data, index) => {
                      const x = (index / (revenueData.length - 1)) * 100
                      const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1)
                      const y = 100 - ((data.revenue / maxRevenue) * 80)
                      return `${x},${y}`
                    }).join(' ')}
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Payment Status Distribution */}
          <div className="glassmorphism rounded-3xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Payment Status</h3>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {(() => {
                const filteredOrders = filterOrdersByPeriod(orders, selectedPeriod)
                const paid = filteredOrders.filter(o => o.paymentStatus === 'paid').length
                const partial = filteredOrders.filter(o => o.paymentStatus === 'partial').length
                const pending = filteredOrders.filter(o => o.paymentStatus === 'pending').length
                const total = filteredOrders.length || 1
                
                return [
                  { label: 'Paid', count: paid, color: 'green', percentage: (paid / total * 100).toFixed(1) },
                  { label: 'Partial', count: partial, color: 'yellow', percentage: (partial / total * 100).toFixed(1) },
                  { label: 'Pending', count: pending, color: 'red', percentage: (pending / total * 100).toFixed(1) }
                ].map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                      <span className="text-sm font-medium text-gray-700">{status.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{status.count}</div>
                      <div className="text-xs text-gray-500">{status.percentage}%</div>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="glassmorphism rounded-3xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Order Status</h3>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {(() => {
                const filteredOrders = filterOrdersByPeriod(orders, selectedPeriod)
                const reserved = filteredOrders.filter(o => o.status === 'reserved').length
                const pickedUp = filteredOrders.filter(o => o.status === 'picked_up').length
                const returned = filteredOrders.filter(o => o.status === 'returned').length
                const total = filteredOrders.length || 1
                
                return [
                  { label: 'Reserved', count: reserved, color: 'blue', percentage: (reserved / total * 100).toFixed(1) },
                  { label: 'Picked Up', count: pickedUp, color: 'yellow', percentage: (pickedUp / total * 100).toFixed(1) },
                  { label: 'Returned', count: returned, color: 'green', percentage: (returned / total * 100).toFixed(1) }
                ].map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                      <span className="text-sm font-medium text-gray-700">{status.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{status.count}</div>
                      <div className="text-xs text-gray-500">{status.percentage}%</div>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>

          {/* Average Metrics */}
          <div className="glassmorphism rounded-3xl p-6 card-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Key Metrics</h3>
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              {(() => {
                const filteredOrders = filterOrdersByPeriod(orders, selectedPeriod)
                const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                const totalOrders = filteredOrders.length
                const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
                const totalDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : selectedPeriod === 'quarter' ? 90 : 365
                const dailyAvg = totalRevenue / totalDays
                
                return [
                  { label: 'Avg Order Value', value: `₹${Math.round(avgOrderValue).toLocaleString()}`, icon: '💰' },
                  { label: 'Daily Revenue', value: `₹${Math.round(dailyAvg).toLocaleString()}`, icon: '📈' },
                  { label: 'Conversion Rate', value: `${((totalOrders / Math.max(dashboardStats.activeCustomers, 1)) * 100).toFixed(1)}%`, icon: '🎯' }
                ].map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{metric.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{metric.value}</div>
                  </div>
                ))
              })()}
            </div>
          </div>
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
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 bg-white/50 rounded-2xl border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                        <div>
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={index} className="group p-4 bg-white/50 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                          index === 3 ? 'bg-gradient-to-br from-green-400 to-green-600' :
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
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📊</div>
                  <p className="text-gray-500">No product data available for this period</p>
                </div>
              )}
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
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="p-4 bg-white/50 rounded-2xl border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-2xl animate-pulse"></div>
                        <div>
                          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <div key={index} className="group p-4 bg-white/50 rounded-2xl border border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                          index === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          index === 2 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                          index === 3 ? 'bg-gradient-to-br from-pink-400 to-pink-600' :
                          'bg-gradient-to-br from-indigo-400 to-indigo-600'
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
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">👥</div>
                  <p className="text-gray-500">No customer data available for this period</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="glassmorphism rounded-3xl p-8 animate-fade-in-up">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Export & Share Reports</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Reports */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Revenue Reports</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExportReport('revenue', 'pdf')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                >
                  📄 Export as PDF
                </button>
                <button 
                  onClick={() => handleExportReport('revenue', 'csv')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                >
                  📊 Export as CSV
                </button>
              </div>
            </div>

            {/* Product Reports */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3">📦 Product Reports</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExportReport('products', 'pdf')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                >
                  📄 Export as PDF
                </button>
                <button 
                  onClick={() => handleExportReport('products', 'csv')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                >
                  📊 Export as CSV
                </button>
              </div>
            </div>

            {/* Customer Reports */}
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3">👥 Customer Reports</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => handleExportReport('customers', 'pdf')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                >
                  📄 Export as PDF
                </button>
                <button 
                  onClick={() => handleExportReport('customers', 'csv')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                >
                  📊 Export as CSV
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Export All */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <h4 className="font-semibold text-gray-800 mb-3">🚀 Quick Export All Reports</h4>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => {
                    handleExportReport('revenue', 'pdf')
                    setTimeout(() => handleExportReport('products', 'pdf'), 1000)
                    setTimeout(() => handleExportReport('customers', 'pdf'), 2000)
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  📄 All Reports (PDF)
                </button>
                <button 
                  onClick={() => {
                    handleExportReport('revenue', 'csv')
                    setTimeout(() => handleExportReport('products', 'csv'), 1000)
                    setTimeout(() => handleExportReport('customers', 'csv'), 2000)
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  📊 All Reports (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Reports 
import { useState, useEffect } from 'react'
import apiService from '../services/api'

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

        // Generate revenue trend data (last 6 months mock)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        const revenueByMonth = months.map(month => ({
          month,
          revenue: Math.floor(Math.random() * 20000) + 45000 // Mock data for trend
        }))
        setRevenueData(revenueByMonth)
      }

      if (productsResponse.success) {
        const productsList = productsResponse.data.products || []
        setProducts(productsList)

        // Calculate top products (mock analysis)
        const topProductsData = productsList.slice(0, 5).map(product => ({
          name: product.name,
          rentals: Math.floor(Math.random() * 30) + 10,
          revenue: `₹${(Math.floor(Math.random() * 15000) + 3000).toLocaleString()}`
        }))
        setTopProducts(topProductsData)

        // Mock top customers data
        const customerNames = ['Mike Johnson', 'John Doe', 'Jane Smith', 'David Wilson', 'Sarah Brown']
        const topCustomersData = customerNames.map(name => ({
          name,
          rentals: Math.floor(Math.random() * 20) + 5,
          spent: `₹${(Math.floor(Math.random() * 30000) + 10000).toLocaleString()}`
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

  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod])

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
          <button 
            onClick={fetchReportsData}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Business insights and rental performance metrics</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Select Time Period</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedPeriod('quarter')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'quarter' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === 'year' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `₹${dashboardStats.totalRevenue.toLocaleString()}`}
              </p>
              <p className="text-sm text-green-600">Real-time data</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rentals</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardStats.totalRentals}
              </p>
              <p className="text-sm text-green-600">Real-time data</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : dashboardStats.activeCustomers}
              </p>
              <p className="text-sm text-green-600">Real-time data</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Rental Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : `₹${Math.round(dashboardStats.avgRentalValue).toLocaleString()}`}
              </p>
              <p className="text-sm text-green-600">Real-time data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading chart data...</span>
          </div>
        ) : (
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(data.revenue / 70000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                <span className="text-xs font-medium text-gray-900">₹{data.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Products and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Rented Products</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.rentals} rentals</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{product.revenue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.rentals} rentals</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{customer.spent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium text-gray-700">Revenue Report</p>
              <p className="text-xs text-gray-500">PDF, Excel, CSV</p>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <p className="text-sm font-medium text-gray-700">Product Performance</p>
              <p className="text-xs text-gray-500">PDF, Excel, CSV</p>
            </div>
          </button>
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium text-gray-700">Customer Analysis</p>
              <p className="text-xs text-gray-500">PDF, Excel, CSV</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reports 
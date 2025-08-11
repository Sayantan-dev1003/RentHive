import { useState, useEffect } from 'react'
import apiService from '../services/api'

// Optimized minimal styles
const optimizedOrderStyles = `
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

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderStats, setOrderStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0
  })
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)

  // Fetch orders and related data
  const fetchOrdersData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch orders, products, and users data in parallel
      const [ordersResponse, productsResponse] = await Promise.all([
        apiService.getOrders(),
        apiService.getProducts()
      ])

      if (ordersResponse.success) {
        setOrders(ordersResponse.data.orders || [])
        
        // Calculate order statistics
        const ordersList = ordersResponse.data.orders || []
        setOrderStats({
          total: ordersList.length,
          confirmed: ordersList.filter(order => ['reserved', 'picked_up'].includes(order.status)).length,
          pending: ordersList.filter(order => order.status === 'quotation').length,
          cancelled: ordersList.filter(order => order.status === 'cancelled').length
        })
      }

      if (productsResponse.success) {
        setProducts(productsResponse.data.products || [])
      }

    } catch (err) {
      setError('Failed to fetch orders data: ' + err.message)
      console.error('Orders data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle view order
  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setShowViewModal(true)
  }

  // Handle edit order
  const handleEditOrder = (order) => {
    setSelectedOrder(order)
    setShowEditModal(true)
  }

  // Handle generate invoice
  const handleGenerateInvoice = async (order) => {
    try {
      setGeneratingInvoice(true)
      // Mock invoice generation - in real app, this would call the backend
      setTimeout(() => {
        setGeneratingInvoice(false)
        alert(`Invoice generated for order ${order.orderId}`)
      }, 2000)
    } catch (err) {
      setGeneratingInvoice(false)
      console.error('Error generating invoice:', err)
      alert('Failed to generate invoice')
    }
  }

  useEffect(() => {
    fetchOrdersData()
  }, [])

  // Transform orders for display
  const transformedOrders = orders.map(order => {
    const orderProducts = order.items?.map(item => {
      const product = products.find(p => p._id === item.productId)
      return product ? product.name : 'Unknown Product'
    }) || []

    return {
      id: order._id,
      orderId: order._id.slice(-6).toUpperCase(),
      customer: 'Customer', // We'll use customer ID for now
      products: orderProducts,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      totalAmount: `₹${order.totalAmount || 0}`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryStatus: getDeliveryStatus(order.status),
      originalData: order
    }
  })

  // Helper function to get delivery status from order status
  function getDeliveryStatus(orderStatus) {
    switch (orderStatus) {
      case 'quotation':
        return 'Not Scheduled'
      case 'reserved':
        return 'Scheduled'
      case 'picked_up':
        return 'Delivered'
      case 'returned':
        return 'Returned'
      case 'late':
        return 'Overdue'
      case 'cancelled':
        return 'Cancelled'
      default:
        return 'Unknown'
    }
  }

  return (
    <>
      <style>{optimizedOrderStyles}</style>
      <div className="min-h-screen bg-gray-50 space-y-6 p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">{error}</span>
              <button 
                onClick={fetchOrdersData}
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
            Order Management
          </h1>
          <p className="text-gray-600">
            Track and manage all rental orders
          </p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="simple-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-blue-500 text-xs font-medium bg-blue-50 px-2 py-1 rounded">
                Total
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.total
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time orders</p>
            </div>
          </div>

          <div className="simple-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                Confirmed
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.confirmed
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Successfully processed</p>
            </div>
          </div>

          <div className="simple-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-yellow-600 text-xs font-medium bg-yellow-50 px-2 py-1 rounded">
                Pending
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.pending
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
            </div>
          </div>

          <div className="simple-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-500 text-xs font-medium bg-red-50 px-2 py-1 rounded">
                Cancelled
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.cancelled
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Cancelled orders</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="simple-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Recent Orders</h2>
              <p className="text-gray-600 text-sm">Track and manage rental orders</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm">
                Export
              </button>
              <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
                New Order
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            </div>
          ) : transformedOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-4">Orders will appear here once customers place them.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Create Order
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {transformedOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="simple-card p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Order Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">#{order.orderId}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.customer}</h3>
                        <p className="text-gray-600 text-sm">{order.orderDate}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.products.slice(0, 1).map((product, productIndex) => (
                            <span key={productIndex} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {product}
                            </span>
                          ))}
                          {order.products.length > 1 && (
                            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                              +{order.products.length - 1} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status & Amount */}
                    <div className="flex items-center space-x-7">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500">Amount</p>
                        <p className="text-xl font-bold text-gray-900">{order.totalAmount}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-500 mb-2">Status</p>
                        <div className="flex flex-col space-y-2">
                          <span className={`status-dot px-4 py-2 text-sm font-bold rounded-lg shadow-md transition-all duration-300 ${
                            ['reserved', 'picked_up'].includes(order.status) ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                            order.status === 'quotation' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                            order.status === 'returned' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                            order.status === 'late' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                            'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-lg ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            order.paymentStatus === 'partial' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => handleViewOrder(order)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-md text-sm"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleGenerateInvoice(order)}
                          disabled={generatingInvoice}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-md text-sm disabled:opacity-50 disabled:transform-none"
                        >
                          {generatingInvoice ? 'Generating...' : 'Invoice'}
                        </button>
                        <button 
                          onClick={() => handleEditOrder(order)}
                          className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-md text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-3xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Order Details
                </h2>
                <p className="text-xl text-gray-600 mt-1">#{selectedOrder.orderId}</p>
              </div>
              <button
                onClick={() => {setShowViewModal(false); setSelectedOrder(null)}}
                className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Order Information */}
              <div className="space-y-6">
                <div className="gradient-border">
                  <div className="gradient-border-inner p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      Order Information
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Order ID</label>
                        <p className="text-lg font-bold text-indigo-600">#{selectedOrder.orderId}</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Customer</label>
                        <p className="text-lg font-bold text-purple-600">{selectedOrder.customer}</p>
                      </div>
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Order Date</label>
                        <p className="text-lg font-bold text-emerald-600">{selectedOrder.orderDate}</p>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Total Amount</label>
                        <p className="text-2xl font-bold text-orange-600">{selectedOrder.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div className="space-y-6">
                <div className="gradient-border">
                  <div className="gradient-border-inner p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Status Information
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white/80 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Order Status</label>
                        <span className={`inline-block px-4 py-2 text-sm font-bold rounded-xl shadow-md ${
                          ['reserved', 'picked_up'].includes(selectedOrder.status) ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                          selectedOrder.status === 'quotation' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                          'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }`}>
                          {selectedOrder.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                        <span className={`inline-block px-4 py-2 text-sm font-bold rounded-xl shadow-md ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                          selectedOrder.paymentStatus === 'partial' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                          'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                        }`}>
                          {selectedOrder.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-white/80 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Status</label>
                        <span className={`inline-block px-4 py-2 text-sm font-bold rounded-xl shadow-md ${
                          selectedOrder.deliveryStatus === 'Delivered' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                          selectedOrder.deliveryStatus === 'Scheduled' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                          'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}>
                          {selectedOrder.deliveryStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="mt-8">
              <div className="gradient-border">
                <div className="gradient-border-inner p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    Rental Products
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900">{product}</span>
                              <p className="text-xs text-gray-500">Rental Equipment</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-indigo-600">Qty: 1</p>
                            <p className="text-xs text-gray-500">Active</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => handleGenerateInvoice(selectedOrder)}
                disabled={generatingInvoice}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg disabled:opacity-50 disabled:transform-none"
              >
                {generatingInvoice ? 'Generating Invoice...' : 'Generate Invoice'}
              </button>
              <button
                onClick={() => {setShowViewModal(false); setSelectedOrder(null)}}
                className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glassmorphism rounded-3xl p-8 w-full max-w-lg animate-bounce-in">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Order
                </h2>
                <p className="text-gray-600 mt-1">Update order status and payment information</p>
              </div>
              <button
                onClick={() => {setShowEditModal(false); setSelectedOrder(null)}}
                className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="gradient-border">
                <div className="gradient-border-inner p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Order Status
                    </label>
                    <select 
                      defaultValue={selectedOrder.status}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-semibold text-gray-700 transition-all duration-300"
                    >
                      <option value="quotation">📝 Quotation</option>
                      <option value="reserved">✅ Reserved</option>
                      <option value="picked_up">📦 Picked Up</option>
                      <option value="returned">🔄 Returned</option>
                      <option value="late">⏰ Late</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      Payment Status
                    </label>
                    <select 
                      defaultValue={selectedOrder.paymentStatus}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm font-semibold text-gray-700 transition-all duration-300"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="partial">🔵 Partial Payment</option>
                      <option value="paid">💰 Fully Paid</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowEditModal(false); setSelectedOrder(null)}}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Orders 
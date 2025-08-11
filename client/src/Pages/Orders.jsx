import { useState, useEffect } from 'react'
import apiService from '../services/api'

// Modern Animation Styles for Orders
const modernOrderStyles = `
  @keyframes slideInUp {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
    }
  }

  @keyframes statusPulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }

  .animate-slide-in-up {
    animation: slideInUp 0.8s ease-out forwards;
  }

  .animate-bounce-in {
    animation: bounceIn 0.6s ease-out forwards;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .animate-status-pulse {
    animation: statusPulse 2s ease-in-out infinite;
  }

  .glassmorphism {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .card-hover {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-hover:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  }

  .gradient-border {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
    padding: 2px;
    border-radius: 1.5rem;
  }

  .gradient-border-inner {
    background: white;
    border-radius: 1.375rem;
  }

  .status-dot {
    position: relative;
    display: inline-block;
  }

  .status-dot::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -8px;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    animation: statusPulse 2s ease-in-out infinite;
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
      <style>{modernOrderStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50 space-y-8 animate-slide-in-up">
        {/* Error Message */}
        {error && (
          <div className="glassmorphism border border-red-300 text-red-700 px-6 py-4 rounded-3xl animate-bounce-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center animate-glow">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">System Error</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={fetchOrdersData}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Modern Header */}
        <div className="text-center py-6">
          <div className="animate-slide-in-up">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              Order Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive order tracking and management system for rental operations
            </p>
          </div>
        </div>

        {/* Enhanced Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="gradient-border card-hover animate-bounce-in" style={{ animationDelay: '0.1s' }}>
            <div className="gradient-border-inner p-5 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-blue-500 text-sm font-bold bg-blue-50 px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 animate-bounce-in">
                  {loading ? (
                    <div className="w-14 h-8 bg-gray-200 rounded animate-shimmer"></div>
                  ) : (
                    orderStats.total
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">All time orders</p>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <div className="gradient-border-inner p-5 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-emerald-500 text-sm font-bold bg-emerald-50 px-2 py-1 rounded-full">
                  +{Math.round((orderStats.confirmed / Math.max(orderStats.total, 1)) * 100)}%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Confirmed</p>
                <p className="text-3xl font-bold text-gray-900 animate-bounce-in">
                  {loading ? (
                    <div className="w-14 h-8 bg-gray-200 rounded animate-shimmer"></div>
                  ) : (
                    orderStats.confirmed
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">Successfully processed</p>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-bounce-in" style={{ animationDelay: '0.3s' }}>
            <div className="gradient-border-inner p-5 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-yellow-600 text-sm font-bold bg-yellow-50 px-2 py-1 rounded-full animate-status-pulse">
                  Pending
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 animate-bounce-in">
                  {loading ? (
                    <div className="w-14 h-8 bg-gray-200 rounded animate-shimmer"></div>
                  ) : (
                    orderStats.pending
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-bounce-in" style={{ animationDelay: '0.4s' }}>
            <div className="gradient-border-inner p-5 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-red-500 text-sm font-bold bg-red-50 px-2 py-1 rounded-full">
                  {Math.round((orderStats.cancelled / Math.max(orderStats.total, 1)) * 100)}%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Cancelled</p>
                <p className="text-3xl font-bold text-gray-900 animate-bounce-in">
                  {loading ? (
                    <div className="w-14 h-8 bg-gray-200 rounded animate-shimmer"></div>
                  ) : (
                    orderStats.cancelled
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">Cancelled orders</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Orders Section */}
        <div className="glassmorphism rounded-2xl p-6 card-hover animate-slide-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Orders</h2>
              <p className="text-gray-600">Track and manage all rental orders in real-time</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
                Export Orders
              </button>
              <button className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
                New Order
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-5"></div>
                <p className="text-gray-600 font-semibold">Loading order data...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the latest orders</p>
              </div>
            </div>
          ) : transformedOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Orders Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">Your order management dashboard is ready. Orders will appear here once customers start placing them.</p>
              <button className="px-7 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg">
                Create Sample Order
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {transformedOrders.map((order, index) => (
                <div key={order.id} className="glassmorphism rounded-xl p-5 card-hover animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Order Info */}
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">#{order.orderId}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{order.customer}</h3>
                        <p className="text-gray-600">{order.orderDate}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {order.products.slice(0, 2).map((product, productIndex) => (
                            <span key={productIndex} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">
                              {product}
                            </span>
                          ))}
                          {order.products.length > 2 && (
                            <span className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full font-medium">
                              +{order.products.length - 2} more
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
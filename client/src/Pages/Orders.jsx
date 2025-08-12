import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
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
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer: '',
    product: '',
    startDate: '',
    endDate: '',
    totalAmount: 0
  })

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
        const ordersList = ordersResponse.data.orders || []
        console.log('📋 Loaded orders from database:', ordersList.length, ordersList);
        setOrders(ordersList)
        
        // Calculate order statistics
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
      console.log('🧾 Generating invoice for order:', order.id, order);
      // Call backend API to generate invoice using apiService
      const response = await apiService.generateInvoice(order.id)
      
      if (response.success) {
        toast.success(`Invoice generated successfully for order ${order.orderId}`, {
          position: "top-right",
          autoClose: 3000
        })
        
        // If the invoice has a download URL, automatically download it
        if (response.data && response.data.downloadUrl) {
      setTimeout(() => {
            handleDownloadInvoice(order)
          }, 1000)
        }
      } else {
        throw new Error(response.message || 'Failed to generate invoice')
      }
    } catch (err) {
      console.error('Error generating invoice:', err)
      toast.error(`Failed to generate invoice: ${err.message}`, {
        position: "top-right",
        autoClose: 5000
      })
    } finally {
      setGeneratingInvoice(false)
    }
  }

  // Handle view invoice (opens in new tab without downloading)
  const handleViewInvoice = async (order) => {
    try {
      setViewingInvoice(true)
      console.log('👁️ Viewing invoice for order:', order.id, order);
      
      const response = await apiService.downloadInvoice(order.id)
      
      if (response.success && response.data) {
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        
        // Open the invoice in a new tab with a better viewer
        const newTab = window.open()
        if (newTab) {
          // Check if it's HTML content or PDF
          const isHtmlContent = blob.type.includes('text/html')
          
          if (isHtmlContent) {
            // For HTML content (mock invoices), display it directly with enhanced styling
            blob.text().then(htmlContent => {
              const enhancedHtml = htmlContent.replace(
                '<head>',
                `<head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    @media print { .no-print { display: none; } }
                    .invoice-controls {
                      position: fixed;
                      top: 10px;
                      right: 10px;
                      z-index: 1000;
                      background: white;
                      padding: 10px;
                      border-radius: 8px;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .invoice-controls button {
                      background: #3b82f6;
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      margin: 0 4px;
                      border-radius: 4px;
                      cursor: pointer;
                      font-size: 14px;
                    }
                    .invoice-controls button:hover { background: #2563eb; }
                    .btn-success { background: #10b981 !important; }
                    .btn-success:hover { background: #059669 !important; }
                    .btn-secondary { background: #6b7280 !important; }
                    .btn-secondary:hover { background: #4b5563 !important; }
                  </style>`
              ).replace(
                '<body>',
                `<body>
                  <div class="invoice-controls no-print">
                    <button onclick="window.print()">🖨️ Print</button>
                    <button class="btn-success" onclick="downloadHtml()">💾 Download</button>
                    <button class="btn-secondary" onclick="window.close()">✕ Close</button>
                  </div>
                  <script>
                    function downloadHtml() {
                      const content = document.documentElement.outerHTML;
                      const blob = new Blob([content], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'invoice-${order.orderId}.html';
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  </script>`
              )
              
              newTab.document.write(enhancedHtml)
              newTab.document.close()
            })
          } else {
            // For PDF content, use iframe viewer
            newTab.document.write(`
              <html>
                <head>
                  <title>Invoice ${order.orderId} - RentHive</title>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      background: #f8fafc;
                      min-height: 100vh;
                    }
                    .header { 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white; 
                      padding: 1rem; 
                      text-align: center;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                    .header p { opacity: 0.9; }
                    .controls { 
                      background: white;
                      padding: 1rem; 
                      text-align: center; 
                      border-bottom: 1px solid #e2e8f0;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    .btn { 
                      background: #3b82f6; 
                      color: white; 
                      border: none; 
                      padding: 0.75rem 1.5rem; 
                      margin: 0 0.5rem; 
                      border-radius: 0.5rem; 
                      cursor: pointer; 
                      font-weight: 500;
                      transition: all 0.2s;
                      display: inline-flex;
                      align-items: center;
                      gap: 0.5rem;
                    }
                    .btn:hover { background: #2563eb; transform: translateY(-1px); }
                    .btn-success { background: #10b981; }
                    .btn-success:hover { background: #059669; }
                    .btn-secondary { background: #6b7280; }
                    .btn-secondary:hover { background: #4b5563; }
                    .pdf-container { 
                      padding: 1rem; 
                      height: calc(100vh - 150px); 
                    }
                    iframe { 
                      width: 100%; 
                      height: 100%; 
                      border: 1px solid #e2e8f0; 
                      border-radius: 0.5rem; 
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>📄 Invoice Viewer</h1>
                    <p>Order ${order.orderId} • ${new Date().toLocaleDateString()}</p>
                  </div>
                  <div class="controls">
                    <button class="btn" onclick="window.print()">
                      🖨️ Print
                    </button>
                    <button class="btn btn-success" onclick="downloadPdf()">
                      💾 Download
                    </button>
                    <button class="btn btn-secondary" onclick="window.close()">
                      ✕ Close
                    </button>
                  </div>
                  <div class="pdf-container">
                    <iframe src="${url}" type="application/pdf"></iframe>
                  </div>
                  <script>
                    function downloadPdf() {
                      const a = document.createElement('a');
                      a.href = '${url}';
                      a.download = 'invoice-${order.orderId}.pdf';
                      a.click();
                    }
                    
                    // Clean up URL when window closes
                    window.addEventListener('beforeunload', function() {
                      URL.revokeObjectURL('${url}');
                    });
                  </script>
                </body>
              </html>
            `)
            newTab.document.close()
          }
          
          toast.success(`Invoice opened in new tab for viewing`, {
            position: "top-right",
            autoClose: 2000
          })
        } else {
          toast.error('Unable to open new tab. Please check your browser settings.', {
            position: "top-right",
            autoClose: 5000
          })
        }
      } else {
        throw new Error(response.message || 'Failed to load invoice')
      }
    } catch (err) {
      console.error('Error viewing invoice:', err)
      toast.error(`Failed to view invoice: ${err.message || 'Unknown error occurred'}`, {
        position: "top-right",
        autoClose: 5000
      })
    } finally {
      setViewingInvoice(false)
    }
  }

  // Handle download invoice
  const handleDownloadInvoice = async (order) => {
    try {
      setDownloadingInvoice(true)
      // Call backend API to download invoice using apiService
      const response = await apiService.downloadInvoice(order.id)
      
      if (response.success && response.data) {
        // Create and trigger download
        const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${order.orderId}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success(`Invoice downloaded successfully! Check your downloads folder.`, {
          position: "top-right",
          autoClose: 4000
        })
        
        // Also open the PDF in a new tab so user can view it
        const newTab = window.open()
        if (newTab) {
          newTab.document.write(`
            <html>
              <head>
                <title>Invoice ${order.orderId}</title>
                <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  .header { text-align: center; margin-bottom: 20px; }
                  .controls { text-align: center; margin-bottom: 20px; }
                  .controls button { 
                    background: #3b82f6; color: white; border: none; 
                    padding: 10px 20px; margin: 0 10px; border-radius: 5px; 
                    cursor: pointer; 
                  }
                  .controls button:hover { background: #2563eb; }
                  iframe { border: 1px solid #ddd; border-radius: 8px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h2>Invoice for Order ${order.orderId}</h2>
                </div>
                <div class="controls">
                  <button onclick="window.print()">Print</button>
                  <button onclick="downloadPdf()">Download</button>
                  <button onclick="window.close()">Close</button>
                </div>
                <iframe src="${url}" width="100%" height="80%" type="application/pdf"></iframe>
                <script>
                  function downloadPdf() {
                    const a = document.createElement('a');
                    a.href = '${url}';
                    a.download = 'invoice-${order.orderId}.pdf';
                    a.click();
                  }
                </script>
              </body>
            </html>
          `)
        }
      } else {
        throw new Error(response.message || 'Failed to download invoice')
      }
    } catch (err) {
      console.error('Error downloading invoice:', err)
      toast.error(`Failed to download invoice: ${err.message || 'Unknown error occurred'}`, {
        position: "top-right",
        autoClose: 5000
      })
    } finally {
      setDownloadingInvoice(false)
    }
  }

  // Handle export orders
  const handleExportOrders = async () => {
    try {
      const response = await apiService.exportOrders()
      
      if (response.success && response.data) {
        // Create and trigger download
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        toast.success('Orders exported successfully! Check your downloads folder.', {
          position: "top-right",
          autoClose: 3000
        })
      } else {
        throw new Error(response.message || 'Failed to export orders')
      }
    } catch (err) {
      console.error('Error exporting orders:', err)
      toast.error(`Failed to export orders: ${err.message}`, {
        position: "top-right",
        autoClose: 5000
      })
    }
  }

  // Handle create new order
  const handleCreateOrder = async (e) => {
    e.preventDefault()
    try {
      const response = await apiService.createOrder(newOrder)
      
      if (response.success) {
        toast.success('Order created successfully!', {
          position: "top-right",
          autoClose: 3000
        })
        setShowNewOrderModal(false)
        setNewOrder({
          customer: '',
          product: '',
          startDate: '',
          endDate: '',
          totalAmount: 0
        })
        fetchOrdersData() // Refresh orders list
      } else {
        throw new Error(response.message || 'Failed to create order')
      }
    } catch (err) {
      console.error('Error creating order:', err)
      toast.error(`Failed to create order: ${err.message}`, {
        position: "top-right",
        autoClose: 5000
      })
    }
  }

  useEffect(() => {
    fetchOrdersData()
  }, [])

  // Transform orders for display
  const transformedOrders = orders.map((order, index) => {
    try {
      // Debug logging for problematic orders
      if (!order.customerId) {
        console.warn(`Order ${index} has null/undefined customerId:`, order);
      }
      
    const orderProducts = order.items?.map(item => {
        try {
          // Check if productId is already populated (object) or just an ID (string)
          if (typeof item.productId === 'object' && item.productId && item.productId.name) {
            return item.productId.name;
          }
          // Fallback to finding product in products array
          const product = products.find(p => p._id === (item.productId?._id || item.productId))
      return product ? product.name : 'Unknown Product'
        } catch (err) {
          console.error('Error processing product item:', err, item);
          return 'Unknown Product';
        }
    }) || []

      // Get customer name from populated customerId, billingDetails, or fallback
      let customerName = 'Unknown Customer';
      try {
        // First priority: populated customerId with name
        if (order.customerId && typeof order.customerId === 'object' && order.customerId.name) {
          customerName = order.customerId.name;
        }
        // Second priority: billing details name
        else if (order.billingDetails && order.billingDetails.fullName) {
          customerName = order.billingDetails.fullName;
        }
        // Third priority: customer ID as string
        else if (order.customerId && typeof order.customerId === 'string') {
          customerName = `Customer ${order.customerId.slice(-6)}`;
        }
      } catch (err) {
        console.error('Error processing customer name:', err, order.customerId);
        customerName = 'Unknown Customer';
      }

    return {
        id: order._id || 'unknown-id',
        orderId: order._id ? order._id.slice(-6).toUpperCase() : 'UNKNOWN',
        customer: customerName,
      products: orderProducts,
        orderDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown Date',
      totalAmount: `₹${order.totalAmount || 0}`,
        status: order.status || 'unknown',
        paymentStatus: order.paymentStatus || 'unknown',
        deliveryStatus: getDeliveryStatus(order.status || 'unknown'),
      originalData: order
      }
    } catch (err) {
      console.error('Error transforming order:', err, order);
      return {
        id: 'error-order',
        orderId: 'ERROR',
        customer: 'Error Loading Customer',
        products: ['Error Loading Products'],
        orderDate: 'Error',
        totalAmount: '₹0',
        status: 'error',
        paymentStatus: 'error',
        deliveryStatus: 'Error',
        originalData: order
      }
    }
  })

  // Debug: Log transformed orders
  console.log('🔄 Transformed orders for display:', transformedOrders);

  // Helper function to get delivery status from order status
  function getDeliveryStatus(orderStatus) {
    if (!orderStatus || typeof orderStatus !== 'string') {
      return 'Unknown';
    }
    
    switch (orderStatus.toLowerCase()) {
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
      case 'error':
        return 'Error'
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
        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order Management
              </h1>
              <p className="text-gray-600">
                Track and manage all rental orders
              </p>
            </div>
            <button
              onClick={() => {
                console.log('🔄 Force refreshing orders data...');
                fetchOrdersData();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.total
                )}
          </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.confirmed
                )}
        </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.pending
                )}
            </div>
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
              <div className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  orderStats.cancelled
                )}
              </div>
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
              <button 
                onClick={handleExportOrders}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Export
              </button>
              <button 
                onClick={() => setShowNewOrderModal(true)}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
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
                          onClick={() => handleViewInvoice(order)}
                          disabled={viewingInvoice}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-md text-sm disabled:opacity-50 disabled:transform-none"
                        >
                          {viewingInvoice ? 'Opening...' : '👁️ View Invoice'}
                      </button>
                      <button 
                        onClick={() => handleGenerateInvoice(order)}
                        disabled={generatingInvoice}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-md text-sm disabled:opacity-50 disabled:transform-none"
                      >
                          {generatingInvoice ? 'Generating...' : '📄 Generate'}
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

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Order Details
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-100 text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      #{selectedOrder.orderId}
                    </span>
                    <span className="text-blue-100 text-sm">
                      Created: {selectedOrder.orderDate}
                    </span>
                  </div>
                </div>
              <button
                onClick={() => {setShowViewModal(false); setSelectedOrder(null)}}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-3 transition-all duration-200 transform hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 max-h-[calc(95vh-140px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Information */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      Order Information
                    </h3>
              <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Order ID</label>
                        <p className="text-lg font-bold text-gray-900 font-mono">#{selectedOrder.orderId}</p>
                  </div>
                      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Customer</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedOrder.customer}</p>
                  </div>
                      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Order Date</label>
                        <p className="text-lg font-semibold text-gray-900">{selectedOrder.orderDate}</p>
                  </div>
                      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-600 mb-2">Total Amount</label>
                        <p className="text-2xl font-bold text-green-600">{selectedOrder.totalAmount}</p>
                      </div>
                  </div>
                </div>
              </div>

              {/* Status Information */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Status Information
                    </h3>
              <div className="space-y-4">
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-600 mb-3">Order Status</label>
                        <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl shadow-md transition-all duration-300 ${
                          ['reserved', 'picked_up'].includes(selectedOrder.status) ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                          selectedOrder.status === 'quotation' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                          'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-white mr-2 opacity-80"></div>
                          {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-600 mb-3">Payment Status</label>
                        <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl shadow-md ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          selectedOrder.paymentStatus === 'partial' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-500' :
                            selectedOrder.paymentStatus === 'partial' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }`}></div>
                          {selectedOrder.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-600 mb-3">Delivery Status</label>
                        <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl shadow-md ${
                          selectedOrder.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                          selectedOrder.deliveryStatus === 'Scheduled' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            selectedOrder.deliveryStatus === 'Delivered' ? 'bg-green-500' :
                            selectedOrder.deliveryStatus === 'Scheduled' ? 'bg-blue-500' :
                            'bg-gray-500'
                          }`}></div>
                          {selectedOrder.deliveryStatus.toUpperCase()}
                    </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Invoice Actions */}
                  <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      Invoice Actions
                    </h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => handleViewInvoice(selectedOrder)}
                        disabled={viewingInvoice}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {viewingInvoice ? 'Opening...' : 'View Invoice'}
                      </button>
                      <button 
                        onClick={() => handleGenerateInvoice(selectedOrder)}
                        disabled={generatingInvoice}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
                      </button>
                      <button 
                        onClick={() => handleDownloadInvoice(selectedOrder)}
                        disabled={downloadingInvoice}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                      </button>
                  </div>
                </div>
              </div>
            </div>

              {/* Products Section */}
              <div className="mt-8 col-span-1 lg:col-span-2">
                <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    Rental Products
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedOrder.products.map((product, index) => (
                      <div key={index} className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 text-sm">{product}</span>
                              <p className="text-xs text-orange-600 font-medium">Rental Equipment</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-orange-100">
                          <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900">Qty: 1</p>
                            <p className="text-xs text-green-600 font-medium">• Active</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              ✓ Available
                            </span>
                          </div>
                        </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Last updated: {selectedOrder.orderDate}
                </div>
                <div className="flex space-x-3">
              <button
                    onClick={() => {setShowViewModal(false); setSelectedOrder(null)}}
                    className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 font-semibold border border-gray-300 flex items-center"
              >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
              </button>
              <button
                    onClick={() => handleEditOrder(selectedOrder)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg hover:shadow-xl flex items-center"
              >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Order
              </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Order</h2>
                <p className="text-gray-600 mt-1">Update order status and payment information</p>
              </div>
              <button
                onClick={() => {setShowEditModal(false); setSelectedOrder(null)}}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <select 
                  defaultValue={selectedOrder.status}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="quotation">Quotation</option>
                  <option value="reserved">Reserved</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="returned">Returned</option>
                  <option value="late">Late</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select 
                  defaultValue={selectedOrder.paymentStatus}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                    <option value="partial">Partial Payment</option>
                    <option value="paid">Fully Paid</option>
                </select>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {setShowEditModal(false); setSelectedOrder(null)}}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Order</h2>
                <p className="text-gray-600 mt-1">Add a new rental order to the system</p>
    </div>
              <button
                onClick={() => {setShowNewOrderModal(false); setNewOrder({customer: '', product: '', startDate: '', endDate: '', totalAmount: 0})}}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product/Equipment</label>
                  <select
                    value={newOrder.product}
                    onChange={(e) => setNewOrder({...newOrder, product: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select product...</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newOrder.startDate}
                    onChange={(e) => setNewOrder({...newOrder, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={newOrder.endDate}
                    onChange={(e) => setNewOrder({...newOrder, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₹)</label>
                <input
                  type="number"
                  value={newOrder.totalAmount}
                  onChange={(e) => setNewOrder({...newOrder, totalAmount: parseFloat(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter total amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {setShowNewOrderModal(false); setNewOrder({customer: '', product: '', startDate: '', endDate: '', totalAmount: 0})}}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Order
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
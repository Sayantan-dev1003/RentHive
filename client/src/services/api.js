const API_BASE_URL = 'http://localhost:8000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    // Get auth token
    let token = localStorage.getItem('token')
    
    // Temporary test token for development
    if (!token) {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODlhN2E3NTYzMzk4MGYyZDQ1ZWM2ZWEiLCJpYXQiOjE3NTQ5NTQzNTcsImV4cCI6MTc1NTA0MDc1NywiaXNzIjoicmVudGhpdmUtYXBpIn0.b_SPDawmXxUEdcbQnx9RIQAg54I1w2fvCA8NozqCdyQ';
    }
    
    // Default headers, to be overridden if a FormData body is used
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

    const config = {
      headers: defaultHeaders,
      ...options,
    }

    // If the body is an instance of FormData, remove the Content-Type header
    // so the browser can set it correctly as 'multipart/form-data'
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type']
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      throw error
    }
  }

  // Products API
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/products?${queryString}` : '/products'
    return this.request(endpoint)
  }

  async getProductCategories() {
    return this.request('/products/categories')
  }

  // Create product with form data (including images)
  async createProduct(productData, images = []) {
    const formData = new FormData()
    
    // Add text fields to FormData
    formData.append('name', productData.name)
    formData.append('category', productData.category)
    formData.append('description', productData.description)
    formData.append('rentable', 'true')
    formData.append('pricing', JSON.stringify(productData.pricing))
    formData.append('stock', productData.stock.toString())
    
    // Add specifications if any
    if (productData.specifications) {
      formData.append('specifications', JSON.stringify(productData.specifications))
    }
    
    // Add image files
    images.forEach((file, index) => {
      formData.append('images', file)
    })
    
    return this.request('/products', {
      method: 'POST',
      body: formData
    })
  }

  // Update product with form data (including images)
  async updateProduct(id, productData, newImages = []) {
    const formData = new FormData()
    
    // Add text fields to FormData
    formData.append('name', productData.name)
    formData.append('category', productData.category)
    formData.append('description', productData.description)
    formData.append('rentable', 'true')
    formData.append('pricing', JSON.stringify(productData.pricing))
    formData.append('stock', productData.stock.toString())
    
    // Add existing images as a JSON string
    if (productData.images && productData.images.length > 0) {
      formData.append('images', JSON.stringify(productData.images))
    }
    
    // Add specifications if any
    if (productData.specifications) {
      formData.append('specifications', JSON.stringify(productData.specifications))
    }
    
    // Add new image files
    newImages.forEach((file, index) => {
      formData.append('images', file)
    })
    
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: formData
    })
  }

  // Assuming `deleteProduct` should also use the non-dev endpoint
  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE'
    })
  }

  // Orders API - fetch real data from backend
  async getOrders(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
      return await this.request(endpoint);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to empty orders array on error
      return {
        success: false,
        error: error.message || 'Failed to fetch orders',
        data: {
          orders: []
        }
      };
    }
  }

  async getOrderById(id) {
    return this.request(`/dev/orders/${id}`)
  }

  async createOrder(orderData) {
    return this.request('/dev/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
  }

  async createQuote(quoteData) {
    return this.request('/dev/orders/quote', {
      method: 'POST',
      body: JSON.stringify(quoteData)
    })
  }

  async updateOrder(id, updateData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  async updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }

  // Invoice methods
  async generateInvoice(orderId) {
    try {
      const response = await this.request(`/orders/${orderId}/invoice`, {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('Error generating invoice:', error)
      
      // If it's a mock order (starts with "mock-"), return a mock response
      if (orderId.startsWith('mock-')) {
        return {
          success: true,
          message: 'Mock invoice generated successfully',
          data: { 
            invoiceId: `INV-${orderId}-${Date.now()}`,
            downloadUrl: `/api/orders/${orderId}/invoice/download`
          }
        }
      }
      
      throw error
    }
  }

  async downloadInvoice(orderId) {
    try {
      const token = localStorage.getItem('token')
      const url = `${this.baseURL}/orders/${orderId}/invoice`
      const response = await fetch(url, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      })
      
      if (!response.ok) {
        // If it's a mock order, generate a mock PDF
        if (orderId.startsWith('mock-')) {
          return this.generateMockInvoicePDF(orderId)
        }
        
        // Try to get error message from response
        try {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }
      
      // Check if response is JSON (error) or PDF
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to download invoice')
      }
      
      // Get the PDF blob
      const blob = await response.blob()
      return {
        success: true,
        data: blob,
        message: 'Invoice downloaded successfully'
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      
      // If it's a mock order, generate a mock PDF
      if (orderId.startsWith('mock-')) {
        return this.generateMockInvoicePDF(orderId)
      }
      
      throw error
    }
  }

  // Generate a mock PDF for demonstration purposes
  generateMockInvoicePDF(orderId) {
    // Create a simple HTML document and convert it to PDF-like content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .details-section { width: 45%; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f5f5f5; }
            .total-section { text-align: right; }
            .total-line { margin: 5px 0; }
            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RentHive Invoice</h1>
            <p>Professional Equipment Rental Services</p>
          </div>
          
          <div class="invoice-details">
            <div class="details-section">
              <h3>Bill To:</h3>
              <p><strong>Customer Name</strong><br>
              123 Customer Street<br>
              City, State 12345<br>
              customer@email.com</p>
            </div>
            <div class="details-section">
              <h3>Invoice Details:</h3>
              <p><strong>Invoice #:</strong> INV-${orderId}<br>
              <strong>Order #:</strong> ${orderId}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Rental Period</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Professional Camera Equipment</td>
                <td>3 days</td>
                <td>1</td>
                <td>₹450.00</td>
                <td>₹450.00</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-line">Subtotal: ₹450.00</div>
            <div class="total-line">Tax (18%): ₹81.00</div>
            <div class="total-line">Deposit: ₹200.00</div>
            <div class="total-line grand-total">Total Amount: ₹531.00</div>
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 0.9em;">
            <p>Thank you for choosing RentHive!</p>
            <p>For support, contact us at support@renthive.com | +91-xxx-xxx-xxxx</p>
          </div>
        </body>
      </html>
    `
    
    // Convert HTML to blob (simulating PDF)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    
    return {
      success: true,
      data: blob,
      message: 'Mock invoice generated successfully'
    }
  }

  // Export orders
  async exportOrders() {
    try {
      // For development, return mock CSV data
      const mockCsvData = `Order ID,Customer,Amount,Status,Date
mock-order-1,Customer 1,450,reserved,2025-01-12
mock-order-2,Customer 2,360,quotation,2025-01-18
mock-order-3,Customer 3,450,picked_up,2025-01-22`
      
      return {
        success: true,
        data: mockCsvData,
        message: 'Orders exported successfully (mock)'
      }
    } catch (error) {
      console.error('Error exporting orders:', error)
      return {
        success: false,
        message: 'Failed to export orders'
      }
    }
  }

  // Payments API
  async getPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/payments?${queryString}` : '/payments'
    return this.request(endpoint)
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    })
  }

  // Reports API
  async getDashboardStats(period = 'month') {
    return this.request(`/reports/dashboard?period=${period}`)
  }

  async getRevenueStats(period = 'month') {
    return this.request(`/reports/revenue?period=${period}`)
  }

  async getProductStats(period = 'month') {
    return this.request(`/reports/products?period=${period}`)
  }

  async getCustomerStats(period = 'month') {
    return this.request(`/reports/customers?period=${period}`)
  }

  async getOrderStats() {
    return this.request('/reports/orders')
  }

  // Customer API methods
  async getCustomerOrders(customerId = null) {
    const endpoint = customerId ? `/orders?customerId=${customerId}` : '/orders'
    return this.request(endpoint)
  }

  async getCustomerWishlist(customerId) {
    try {
      return this.request(`/users/${customerId}/wishlist`)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      return { success: false, message: error.message }
    }
  }

  async addToWishlist(userId, productId) {
    try {
      return this.request(`/users/${userId}/wishlist`, {
        method: 'POST',
        body: JSON.stringify({ productId })
      })
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      return { success: false, message: error.message }
    }
  }

  async removeFromWishlist(userId, productId) {
    try {
      return this.request(`/users/${userId}/wishlist/${productId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      return { success: false, message: error.message }
    }
  }

  async clearWishlist(userId) {
    try {
      return this.request(`/users/${userId}/wishlist`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      return { success: false, message: error.message }
    }
  }

  async checkWishlistStatus(userId, productId) {
    try {
      return this.request(`/users/${userId}/wishlist/check/${productId}`)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
      return { success: false, message: error.message }
    }
  }

  async getCustomerStats(customerId) {
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        this.getCustomerOrders(customerId),
        this.getProducts()
      ])
      
      const orders = ordersResponse.success ? ordersResponse.data.orders || [] : []
      const products = productsResponse.success ? productsResponse.data.products || [] : []
      
      const totalOrders = orders.length
      const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      const activeOrders = orders.filter(order => ['reserved', 'picked_up'].includes(order.status)).length
      
      return {
        success: true,
        data: {
          totalOrders,
          totalSpent,
          activeOrders,
          availableProducts: products.length,
          recentActivity: orders.slice(0, 5).map(order => ({
            type: 'order',
            description: `Order ${order._id.slice(-6)} ${order.status}`,
            date: order.createdAt,
            status: order.status
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      return { success: false, message: error.message }
    }
  }

  // Notifications API
  async getNotifications(userId) {
    return this.request(`/notifications?userId=${userId}`)
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  }

  // Utility method to transform backend data to frontend format
  transformProduct(product) {
    return {
      id: product._id,
      name: product.name,
      category: product.category,
      description: product.description,
      dailyRate: `₹${product.pricing.day}`,
      weeklyRate: `₹${product.pricing.week}`,
      monthlyRate: `₹${product.pricing.month}`,
      hourlyRate: `₹${product.pricing.hour}`,
      status: product.currentAvailableStock > 0 ? 'Available' : 'Rented',
      stock: product.stock,
      currentAvailableStock: product.currentAvailableStock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      originalData: product
    }
  }

  transformOrder(order, users = [], products = []) {
    const customer = users.find(user => user._id === order.customerId)
    const orderProducts = order.items.map(item => {
      const product = products.find(p => p._id === item.productId)
      return product ? product.name : 'Unknown Product'
    })

    return {
      id: order._id,
      orderId: order._id,
      customer: customer ? customer.name : 'Unknown Customer',
      customerEmail: customer ? customer.email : '',
      products: orderProducts,
      items: order.items,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      totalAmount: `₹${order.totalAmount || 0}`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      pickupDate: order.pickupDate ? new Date(order.pickupDate).toLocaleDateString() : '',
      returnDate: order.returnDate ? new Date(order.returnDate).toLocaleDateString() : '',
      depositAmount: order.depositAmount || 0,
      lateFee: order.lateFee || 0,
      originalData: order
    }
  }

  formatCurrency(amount) {
    return `₹${amount.toLocaleString()}`
  }

  getProductIcon(category) {
    const icons = {
      'Electronics': '📱',
      'Furniture': '🪑',
      'Vehicles': '🚗',
      'Sports': '⚽',
      'Tools': '🔨',
      'Events': '🎉',
      'Camping': '⛺',
      'Other': '📦'
    }
    return icons[category] || '📦'
  }

  // Pickup Slots API
  async getAvailablePickupSlots(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/pickup-slots/available?${queryString}` : '/pickup-slots/available'
    return this.request(endpoint)
  }

  async bookPickupSlot(slotId, orderId) {
    return this.request(`/pickup-slots/${slotId}/book`, {
      method: 'POST',
      body: JSON.stringify({ orderId })
    })
  }

  async cancelPickupSlot(slotId, orderId) {
    return this.request(`/pickup-slots/${slotId}/booking/${orderId}`, {
      method: 'DELETE'
    })
  }

  async getPickupSlotsByDate(date) {
    return this.request(`/pickup-slots/date/${date}`)
  }

  async getAllPickupSlots(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/pickup-slots?${queryString}` : '/pickup-slots'
    return this.request(endpoint)
  }

  async createPickupSlots(slotData) {
    return this.request('/pickup-slots/bulk', {
      method: 'POST',
      body: JSON.stringify(slotData)
    })
  }

  async updatePickupSlot(slotId, updateData) {
    return this.request(`/pickup-slots/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  async deletePickupSlot(slotId) {
    return this.request(`/pickup-slots/${slotId}`, {
      method: 'DELETE'
    })
  }

  async markPickupCompleted(slotId, orderId, notes = '') {
    return this.request(`/pickup-slots/${slotId}/complete/${orderId}`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    })
  }

  // Enhanced Reporting API
  async getRevenueReport(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/reports/total-revenue?${queryString}` : '/reports/total-revenue'
    return this.request(endpoint)
  }

  async getMostRentedProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/reports/most-rented-products?${queryString}` : '/reports/most-rented-products'
    return this.request(endpoint)
  }

  async getTopCustomersReport(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/reports/top-customers?${queryString}` : '/reports/top-customers'
    return this.request(endpoint)
  }

  async getInventoryReport(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/reports/inventory?${queryString}` : '/reports/inventory'
    return this.request(endpoint)
  }

  async exportReport(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/reports/export?${queryString}` : '/reports/export'
    return this.request(endpoint)
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
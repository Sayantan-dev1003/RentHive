const API_BASE_URL = 'http://localhost:8000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Helper method for making API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    // Default headers, to be overridden if a FormData body is used
    const defaultHeaders = {
      'Content-Type': 'application/json',
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

  // Renamed and updated to use the correct endpoint
  async createProduct(formData) {
    // The endpoint should be `/products`, not `/dev/products`
    return this.request('/products', {
      method: 'POST',
      body: formData
    })
  }

  async uploadProductImages(formData) {
    return this.request('/products/upload-images', {
      method: 'POST',
      body: formData,
    });
  }

  // This function is now responsible for sending FormData with files
  async updateProduct(id, formData) {
    // The endpoint should be `/products/${id}`, not `/dev/products/${id}`
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

  // Orders API (using mock data for development)
  async getOrders(params = {}) {
    // Return mock orders data that matches the seeded data structure
    return {
      success: true,
      data: {
        orders: [
          {
            _id: "mock-order-1",
            customerId: "64df7f3a4b9c4d8e5f9a1234",
            items: [
              {
                productId: "mock-product-1",
                quantity: 1,
                rentalDuration: {
                  startDate: "2025-01-15T00:00:00Z",
                  endDate: "2025-01-18T23:59:59Z"
                },
                priceApplied: {
                  basePrice: 450,
                  discountAmount: 0,
                  totalPrice: 450
                }
              }
            ],
            status: 'reserved',
            paymentStatus: 'paid',
            totalAmount: 450,
            depositAmount: 200,
            lateFee: 0,
            createdAt: "2025-01-12T09:30:00Z"
          },
          {
            _id: "mock-order-2",
            customerId: "64df7f3a4b9c4d8e5f9a1235",
            items: [
              {
                productId: "mock-product-2",
                quantity: 2,
                rentalDuration: {
                  startDate: "2025-01-20T00:00:00Z",
                  endDate: "2025-01-23T23:59:59Z"
                },
                priceApplied: {
                  basePrice: 360,
                  discountAmount: 0,
                  totalPrice: 360
                }
              }
            ],
            status: 'quotation',
            paymentStatus: 'pending',
            totalAmount: 360,
            depositAmount: 100,
            lateFee: 0,
            createdAt: "2025-01-18T14:20:00Z"
          },
          {
            _id: "mock-order-3",
            customerId: "64df7f3a4b9c4d8e5f9a1236",
            items: [
              {
                productId: "mock-product-3",
                quantity: 1,
                rentalDuration: {
                  startDate: "2025-01-25T00:00:00Z",
                  endDate: "2025-01-26T23:59:59Z"
                },
                priceApplied: {
                  basePrice: 450,
                  discountAmount: 0,
                  totalPrice: 450
                }
              }
            ],
            status: 'picked_up',
            paymentStatus: 'paid',
            totalAmount: 450,
            depositAmount: 150,
            lateFee: 0,
            createdAt: "2025-01-22T11:15:00Z"
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          hasNext: false,
          hasPrev: false
        }
      }
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
}

// Create and export a singleton instance
const apiService = new ApiService()
export default apiService
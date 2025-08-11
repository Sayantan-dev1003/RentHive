import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://localhost:8000/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [categories, setCategories] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Form state for adding new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    pricing: {
      hour: '',
      day: '',
      week: '',
      month: ''
    },
    stock: 1,
    images: []
  })

  // Form state for editing product
  const [editProduct, setEditProduct] = useState({
    name: '',
    category: '',
    description: '',
    pricing: {
      hour: '',
      day: '',
      week: '',
      month: ''
    },
    stock: 1,
    images: []
  })

  // API Functions
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/products`)
      const data = await response.json()
      
      if (data.success) {
        // Transform backend data to match frontend format
        const transformedProducts = data.data.products.map(product => ({
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
          image: getProductIcon(product.category),
          rating: Math.random() * 0.5 + 4.5, // Random rating for demo
          totalRentals: Math.floor(Math.random() * 50) + 10, // Random rentals for demo
          originalData: product
        }))
        setProducts(transformedProducts)
      }
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`)
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const createProduct = async (productData) => {
    try {
      // Use development route that bypasses auth
      const response = await fetch(`${API_BASE_URL}/dev/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh products list
        fetchProducts()
        setShowAddModal(false)
        // Reset form
        setNewProduct({
          name: '',
          category: '',
          description: '',
          pricing: { hour: '', day: '', week: '', month: '' },
          stock: 1,
          images: []
        })
        setError(null)
      } else {
        throw new Error(data.message || 'Failed to create product')
      }
    } catch (err) {
      setError('Failed to create product: ' + err.message)
      console.error('Error creating product:', err)
    }
  }

  const updateProduct = async (id, updateData) => {
    try {
      // Use development route that bypasses auth
      const response = await fetch(`${API_BASE_URL}/dev/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchProducts()
        setShowEditModal(false)
        setEditingProduct(null)
        setEditProduct({
          name: '',
          category: '',
          description: '',
          pricing: { hour: '', day: '', week: '', month: '' },
          stock: 1,
          images: []
        })
        setError(null)
      } else {
        throw new Error(data.message || 'Failed to update product')
      }
    } catch (err) {
      setError('Failed to update product: ' + err.message)
      console.error('Error updating product:', err)
    }
  }

  // Function to open edit modal with product data
  const openEditModal = (product) => {
    setEditingProduct(product)
    setEditProduct({
      name: product.name,
      category: product.category,
      description: product.description,
      pricing: {
        hour: product.originalData?.pricing?.hour || product.hourlyRate?.replace('₹', '') || '',
        day: product.originalData?.pricing?.day || product.dailyRate?.replace('₹', '') || '',
        week: product.originalData?.pricing?.week || product.weeklyRate?.replace('₹', '') || '',
        month: product.originalData?.pricing?.month || product.monthlyRate?.replace('₹', '') || ''
      },
      stock: product.stock || product.originalData?.stock || 1,
      images: product.originalData?.images || []
    })
    setShowEditModal(true)
  }

  // Function to handle edit form submission
  const handleEditSubmit = (e) => {
    e.preventDefault()
    updateProduct(editingProduct.id, editProduct)
  }

  const deleteProduct = async (id) => {
    try {
      if (!confirm('Are you sure you want to delete this product?')) {
        return
      }
      
      // Use development route that bypasses auth
      const response = await fetch(`${API_BASE_URL}/dev/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        fetchProducts()
        setError(null)
      } else {
        throw new Error(data.message || 'Failed to delete product')
      }
    } catch (err) {
      setError('Failed to delete product: ' + err.message)
      console.error('Error deleting product:', err)
    }
  }

  // Helper function to get product icon based on category
  const getProductIcon = (category) => {
    const icons = {
      'Electronics': '📱',
      'Furniture': '🪑',
      'Vehicles': '🚗',
      'Sports': '⚽',
      'Tools': '🔨',
      'Events': '🎉',
      'Other': '📦'
    }
    return icons[category] || '📦'
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || product.category === selectedCategory
    const matchesStatus = !selectedStatus || selectedStatus === 'All Status' || product.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    const timer = setTimeout(() => setAnimateCards(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Page Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Product Management</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600">Manage your rentable products and pricing strategies</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0 w-full">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] text-white px-4 lg:px-6 py-3 rounded-xl hover:from-[#1e3a8a] hover:to-[#1e40af] transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>➕</span>
              <span>Add Product</span>
            </span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2542ff] focus:border-transparent transition-all duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white">
              <option>All Prices</option>
              <option>₹0 - ₹100</option>
              <option>₹100 - ₹500</option>
              <option>₹500+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white">
              <option>Name A-Z</option>
              <option>Price Low-High</option>
              <option>Price High-Low</option>
              <option>Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2542ff]"></div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 w-full">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
          <div 
            key={product.id} 
            className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-xl w-full ${
              animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            {/* Product Image */}
            <div className="relative h-40 lg:h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
              <div className="text-4xl lg:text-6xl">{product.image}</div>
              
              {/* Status Badge */}
              <div className="absolute top-3 lg:top-4 right-3 lg:right-4">
                <span className={`px-2 lg:px-3 py-1 text-xs font-semibold rounded-full ${
                  product.status === 'Available' ? 'bg-green-100 text-green-800' :
                  product.status === 'Rented' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.status}
                </span>
              </div>

              {/* Rating */}
              <div className="absolute bottom-3 lg:bottom-4 left-3 lg:left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span className="text-xs lg:text-sm font-semibold text-gray-900">{product.rating}</span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 lg:p-6">
              <div className="mb-3 lg:mb-4">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                <p className="text-xs text-gray-400">Total Rentals: {product.totalRentals}</p>
              </div>
              
              {/* Pricing */}
              <div className="space-y-2 mb-4 lg:mb-6">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs lg:text-sm text-gray-600">Daily:</span>
                  <span className="text-xs lg:text-sm font-semibold text-gray-900">{product.dailyRate}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs lg:text-sm text-gray-600">Weekly:</span>
                  <span className="text-xs lg:text-sm font-semibold text-gray-900">{product.weeklyRate}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs lg:text-sm text-gray-600">Monthly:</span>
                  <span className="text-xs lg:text-sm font-semibold text-gray-900">{product.monthlyRate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => openEditModal(product)}
                  className="flex-1 bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] text-white px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold hover:from-[#1e3a8a] hover:to-[#1e40af] transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteProduct(product.id)}
                  className="flex-1 bg-red-50 text-red-600 px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold hover:bg-red-100 transition-all duration-200 transform hover:scale-105 border border-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
          )}
      </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 lg:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Add New Product</h2>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                createProduct(newProduct)
              }}
              className="space-y-4 lg:space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 resize-none"
                  placeholder="Enter product description"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Sports">Sports</option>
                  <option value="Tools">Tools</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 1})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate</label>
                  <input
                    type="number"
                    value={newProduct.pricing.hour}
                    onChange={(e) => setNewProduct({
                      ...newProduct, 
                      pricing: {...newProduct.pricing, hour: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Rate</label>
                  <input
                    type="number"
                    value={newProduct.pricing.day}
                    onChange={(e) => setNewProduct({
                      ...newProduct, 
                      pricing: {...newProduct.pricing, day: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weekly Rate</label>
                  <input
                    type="number"
                    value={newProduct.pricing.week}
                    onChange={(e) => setNewProduct({
                      ...newProduct, 
                      pricing: {...newProduct.pricing, week: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rate</label>
                  <input
                    type="number"
                    value={newProduct.pricing.month}
                    onChange={(e) => setNewProduct({
                      ...newProduct, 
                      pricing: {...newProduct.pricing, month: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 lg:pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold hover:from-[#1e3a8a] hover:to-[#1e40af] transition-all duration-200 shadow-lg"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 lg:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Edit Product</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4 lg:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={editProduct.description}
                  onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 resize-none"
                  placeholder="Enter product description"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select 
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Sports">Sports</option>
                  <option value="Tools">Tools</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({...editProduct, stock: parseInt(e.target.value) || 1})}
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="1"
                  min="1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate</label>
                  <input
                    type="number"
                    value={editProduct.pricing.hour}
                    onChange={(e) => setEditProduct({
                      ...editProduct, 
                      pricing: {...editProduct.pricing, hour: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Rate</label>
                  <input
                    type="number"
                    value={editProduct.pricing.day}
                    onChange={(e) => setEditProduct({
                      ...editProduct, 
                      pricing: {...editProduct.pricing, day: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weekly Rate</label>
                  <input
                    type="number"
                    value={editProduct.pricing.week}
                    onChange={(e) => setEditProduct({
                      ...editProduct, 
                      pricing: {...editProduct.pricing, week: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rate</label>
                  <input
                    type="number"
                    value={editProduct.pricing.month}
                    onChange={(e) => setEditProduct({
                      ...editProduct, 
                      pricing: {...editProduct.pricing, month: e.target.value}
                    })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 lg:pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold hover:from-[#1e3a8a] hover:to-[#1e40af] transition-all duration-200 shadow-lg"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products 
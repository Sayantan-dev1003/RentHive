import { useState, useEffect } from 'react'
import apiService from '../services/api'

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
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedSort, setSelectedSort] = useState('Name A-Z')
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
  
  // Image upload states
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  
  // Edit image states
  const [editSelectedImages, setEditSelectedImages] = useState([])
  const [editImagePreviewUrls, setEditImagePreviewUrls] = useState([])
  const [uploadingEditImages, setUploadingEditImages] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  
  // Delete confirmation state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

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
      const data = await apiService.getProducts()
      
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
          image: apiService.getProductIcon(product.category),
          rating: (Math.random() * 0.5 + 4.5).toFixed(1), // Random rating for demo, fixed to 1 decimal
          totalRentals: Math.floor(Math.random() * 50) + 10, // Random rentals for demo
          originalData: product
        }))
        setProducts(transformedProducts)
      }
    } catch (err) {
      setError('Failed to fetch products: ' + err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await apiService.getProductCategories()
      
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const createProduct = async (productData) => {
    try {
      setUploadingImages(true)
      
      // Create product with images directly
      const data = await apiService.createProduct(productData, selectedImages)
      
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
        setSelectedImages([])
        setImagePreviewUrls([])
        showToast('Product created successfully', 'success')
        setError(null)
      } else {
        throw new Error(data.message || 'Failed to create product')
      }
    } catch (err) {
      showToast('Failed to create product: ' + err.message, 'error')
      console.error('Error creating product:', err)
    } finally {
      setUploadingImages(false)
    }
  }

  // Handle image selection
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files)
    setSelectedImages(files)
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file))
    setImagePreviewUrls(previewUrls)
  }

  // Remove selected image
  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index)
    
    setSelectedImages(newImages)
    setImagePreviewUrls(newPreviewUrls)
  }

  // Handle edit image selection
  const handleEditImageSelect = (event) => {
    const files = Array.from(event.target.files)
    setEditSelectedImages(files)
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file))
    setEditImagePreviewUrls(previewUrls)
  }

  // Remove edit selected image
  const removeEditImage = (index) => {
    const newImages = editSelectedImages.filter((_, i) => i !== index)
    const newPreviewUrls = editImagePreviewUrls.filter((_, i) => i !== index)
    
    setEditSelectedImages(newImages)
    setEditImagePreviewUrls(newPreviewUrls)
  }

  // Show toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  // Handle delete confirmation
  const handleDeleteClick = (product) => {
    setProductToDelete(product)
    setShowDeleteModal(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!productToDelete) return
    
    try {
      const data = await apiService.deleteProduct(productToDelete.id)
      
      if (data.success) {
        fetchProducts()
        showToast('Product deleted successfully', 'success')
        setError(null)
      } else {
        throw new Error(data.message || 'Failed to delete product')
      }
    } catch (err) {
      showToast('Failed to delete product: ' + err.message, 'error')
      console.error('Error deleting product:', err)
    } finally {
      setShowDeleteModal(false)
      setProductToDelete(null)
    }
  }

  const updateProduct = async (id, updateData) => {
    try {
      setUploadingEditImages(true)
      
      // Update product with new images directly
      const data = await apiService.updateProduct(id, updateData, editSelectedImages)
      
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
        setEditSelectedImages([])
        setEditImagePreviewUrls([])
        showToast('Product updated successfully', 'success')
        setError(null)
      } else {
        throw new Error(data.message || 'Failed to update product')
      }
    } catch (err) {
      showToast('Failed to update product: ' + err.message, 'error')
      console.error('Error updating product:', err)
    } finally {
      setUploadingEditImages(false)
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





  // Filter and sort products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || product.category === selectedCategory
    const matchesStatus = !selectedStatus || selectedStatus === 'All Status' || product.status === selectedStatus
    
    // Price range filter
    let matchesPrice = true
    if (selectedPriceRange && selectedPriceRange !== 'All Prices') {
      const dailyPrice = parseFloat(product.dailyRate?.replace('₹', '')) || 0
      if (selectedPriceRange === '₹0 - ₹100') {
        matchesPrice = dailyPrice >= 0 && dailyPrice <= 100
      } else if (selectedPriceRange === '₹100 - ₹500') {
        matchesPrice = dailyPrice > 100 && dailyPrice <= 500
      } else if (selectedPriceRange === '₹500+') {
        matchesPrice = dailyPrice > 500
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPrice
  }).sort((a, b) => {
    // Sort logic
    switch (selectedSort) {
      case 'Name A-Z':
        return a.name.localeCompare(b.name)
      case 'Price Low-High':
        const priceA = parseFloat(a.dailyRate?.replace('₹', '')) || 0
        const priceB = parseFloat(b.dailyRate?.replace('₹', '')) || 0
        return priceA - priceB
      case 'Price High-Low':
        const priceA2 = parseFloat(a.dailyRate?.replace('₹', '')) || 0
        const priceB2 = parseFloat(b.dailyRate?.replace('₹', '')) || 0
        return priceB2 - priceA2
      case 'Most Popular':
        return b.totalRentals - a.totalRentals
      default:
        return 0
    }
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
            <select 
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white"
            >
              <option value="">All Prices</option>
              <option value="₹0 - ₹100">₹0 - ₹100</option>
              <option value="₹100 - ₹500">₹100 - ₹500</option>
              <option value="₹500+">₹500+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select 
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white"
            >
              <option value="Name A-Z">Name A-Z</option>
              <option value="Price Low-High">Price Low-High</option>
              <option value="Price High-Low">Price High-Low</option>
              <option value="Most Popular">Most Popular</option>
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
            <div className="relative h-40 lg:h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
              {product.originalData?.images && product.originalData.images.length > 0 ? (
                <img 
                  src={product.originalData.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center text-4xl lg:text-6xl" style={{display: product.originalData?.images && product.originalData.images.length > 0 ? 'none' : 'flex'}}>
                {product.image}
              </div>
              
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
                  onClick={() => handleDeleteClick(product)}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Add New Product</h2>
                  <p className="text-blue-100 text-sm">Create a new rental product for your inventory</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  createProduct(newProduct)
                }}
                className="space-y-6"
              >
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
              <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                      <div className="relative">
                <input
                  type="text"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="Enter an attractive product name"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📝
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                      <div className="relative">
                        <textarea
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm"
                          placeholder="Describe what makes this product special..."
                          rows="4"
                          required
                        />
                        <div className="absolute right-3 bottom-3 text-gray-400">
                          💬
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
                {/* Category & Stock Section */}
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Category & Inventory
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <div className="relative">
                        <select 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
                          required
                        >
                          <option value="">Choose a category</option>
                          <option value="Electronics">📱 Electronics</option>
                          <option value="Furniture">🪑 Furniture</option>
                          <option value="Vehicles">🚗 Vehicles</option>
                          <option value="Sports">⚽ Sports</option>
                          <option value="Tools">🔨 Tools</option>
                          <option value="Events">🎉 Events</option>
                          <option value="Other">📦 Other</option>
                </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 1})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="Enter quantity"
                          min="1"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📦
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Product Images
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Images</label>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📷
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select multiple images for your product (JPG, PNG, WebP)</p>
                    </div>

                    {/* Image Previews */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {uploadingImages && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-blue-600 text-sm">Uploading images...</span>
                      </div>
                    )}
                  </div>
                </div>

                              {/* Pricing Section */}
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    Pricing Strategy
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={newProduct.pricing.hour}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            pricing: {...newProduct.pricing, hour: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="100"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /hr
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={newProduct.pricing.day}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            pricing: {...newProduct.pricing, day: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="500"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /day
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Weekly Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={newProduct.pricing.week}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            pricing: {...newProduct.pricing, week: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="2500"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /week
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={newProduct.pricing.month}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            pricing: {...newProduct.pricing, month: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="8000"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /month
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing Tips */}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      💡 Tip: Longer rental periods typically offer better value for customers
                    </p>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 border border-gray-300"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Product
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Edit Product</h2>
                  <p className="text-blue-100 text-sm">Update your product information and settings</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingProduct(null)
                    setEditSelectedImages([])
                    setEditImagePreviewUrls([])
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={editProduct.name}
                          onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="Enter an attractive product name"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📝
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                      <div className="relative">
                        <textarea
                          value={editProduct.description}
                          onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none bg-white/50 backdrop-blur-sm"
                          placeholder="Describe what makes this product special..."
                          rows="4"
                          required
                        />
                        <div className="absolute right-3 bottom-3 text-gray-400">
                          💬
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category & Stock Section */}
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Category & Inventory
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <div className="relative">
                        <select 
                          value={editProduct.category}
                          onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
                          required
                        >
                          <option value="">Choose a category</option>
                          <option value="Electronics">📱 Electronics</option>
                          <option value="Furniture">🪑 Furniture</option>
                          <option value="Vehicles">🚗 Vehicles</option>
                          <option value="Sports">⚽ Sports</option>
                          <option value="Tools">🔨 Tools</option>
                          <option value="Events">🎉 Events</option>
                          <option value="Other">📦 Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <div className="relative">
                        <select 
                          value={editProduct.highlight}
                          onChange={(e) => setEditProduct({...editProduct, category: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none"
                          required
                        >
                          <option value="">Choose a highlight</option>
                          <option value="New">New</option>
                          <option value="Popular">Popular</option>
                          <option value="Discounted">Discounted</option>
                          <option value="Limited-Edition">Limited-Edition</option>
                          <option value="None">None</option>
                          
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={editProduct.stock}
                          onChange={(e) => setEditProduct({...editProduct, stock: parseInt(e.target.value) || 1})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="Enter quantity"
                          min="1"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📦
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Product Images
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Existing Images */}
                    {editProduct.images && editProduct.images.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Images</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {editProduct.images.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Current ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Add New Images</label>
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleEditImageSelect}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          📷
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Select multiple images for your product (JPG, PNG, WebP)</p>
                    </div>

                    {/* New Image Previews */}
                    {editImagePreviewUrls.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Images Preview</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {editImagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeEditImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadingEditImages && (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-blue-600 text-sm">Uploading images...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    Pricing Strategy
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={editProduct.pricing.hour}
                          onChange={(e) => setEditProduct({
                            ...editProduct, 
                            pricing: {...editProduct.pricing, hour: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="100"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /hr
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={editProduct.pricing.day}
                          onChange={(e) => setEditProduct({
                            ...editProduct, 
                            pricing: {...editProduct.pricing, day: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="500"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /day
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Weekly Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={editProduct.pricing.week}
                          onChange={(e) => setEditProduct({
                            ...editProduct, 
                            pricing: {...editProduct.pricing, week: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="2500"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /week
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rate *</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold">₹</div>
                        <input
                          type="number"
                          value={editProduct.pricing.month}
                          onChange={(e) => setEditProduct({
                            ...editProduct, 
                            pricing: {...editProduct.pricing, month: e.target.value}
                          })}
                          className="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="8000"
                          min="0"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                          /month
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pricing Tips */}
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      💡 Tip: Longer rental periods typically offer better value for customers
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingProduct(null)
                      setEditSelectedImages([])
                      setEditImagePreviewUrls([])
                    }}
                    className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 border border-gray-300"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingEditImages}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <span className="flex items-center justify-center">
                      {uploadingEditImages ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Update Product
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? 
              This will permanently remove the product from your inventory.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProductToDelete(null)
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
          <div className={`
            px-6 py-4 rounded-xl shadow-lg border-l-4 flex items-center space-x-3 max-w-sm
            ${toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
              toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
              'bg-yellow-50 border-yellow-500 text-yellow-800'}
          `}>
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products 
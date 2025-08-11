import { useState, useEffect } from 'react'

const Products = () => {
  const [products] = useState([
    {
      id: 1,
      name: 'Drill Machine',
      category: 'Tools',
      dailyRate: '₹200',
      weeklyRate: '₹1,200',
      monthlyRate: '₹4,500',
      status: 'Available',
      image: '🔨',
      rating: 4.8,
      totalRentals: 45
    },
    {
      id: 2,
      name: 'Ladder',
      category: 'Equipment',
      dailyRate: '₹150',
      weeklyRate: '₹900',
      monthlyRate: '₹3,200',
      status: 'Rented',
      image: '🪜',
      rating: 4.6,
      totalRentals: 32
    },
    {
      id: 3,
      name: 'Generator',
      category: 'Machinery',
      dailyRate: '₹500',
      weeklyRate: '₹3,000',
      monthlyRate: '₹10,000',
      status: 'Available',
      image: '⚡',
      rating: 4.9,
      totalRentals: 28
    },
    {
      id: 4,
      name: 'Cement Mixer',
      category: 'Construction',
      dailyRate: '₹300',
      weeklyRate: '₹1,800',
      monthlyRate: '₹6,500',
      status: 'Maintenance',
      image: '🏗️',
      rating: 4.7,
      totalRentals: 22
    }
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCards(true), 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full space-y-6">
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
          <button className="w-full sm:w-auto bg-white text-gray-700 px-4 lg:px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg border border-gray-200">
            <span className="flex items-center justify-center space-x-2">
              <span>📊</span>
              <span>Bulk Import</span>
            </span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2542ff] focus:border-transparent transition-all duration-200"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button className="w-full sm:w-auto p-3 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-200">
            <span>⚙️</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 lg:p-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white">
              <option>All Categories</option>
              <option>Tools</option>
              <option>Equipment</option>
              <option>Machinery</option>
              <option>Construction</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200 bg-white">
              <option>All Status</option>
              <option>Available</option>
              <option>Rented</option>
              <option>Maintenance</option>
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 w-full">
        {products.map((product, index) => (
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
                <button className="flex-1 bg-gradient-to-r from-[#2542ff] to-[#1e3a8a] text-white px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold hover:from-[#1e3a8a] hover:to-[#1e40af] transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Edit
                </button>
                <button className="flex-1 bg-white text-gray-700 px-3 lg:px-4 py-2 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 border border-gray-200">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 lg:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Add New Product</h2>
            <form className="space-y-4 lg:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200">
                  <option>Select category</option>
                  <option>Tools</option>
                  <option>Equipment</option>
                  <option>Machinery</option>
                  <option>Construction</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Rate</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weekly Rate</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Rate</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 lg:py-3 focus:outline-none focus:ring-2 focus:ring-[#2542ff] transition-all duration-200"
                    placeholder="₹"
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
    </div>
  )
}

export default Products 
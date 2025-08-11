import React, { useState } from "react";
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Wishlist() {
  const { 
    wishlistItems, 
    loading, 
    removeFromWishlist, 
    clearWishlist,
    fetchWishlist 
  } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [error, setError] = useState(null);

  // Handle remove from wishlist with error handling
  const handleRemoveFromWishlist = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (!result.success) {
      setError(result.message);
    } else {
      setError(null);
    }
  };

  // Handle clear wishlist with error handling
  const handleClearWishlist = async () => {
    const result = await clearWishlist();
    if (!result.success) {
      setError(result.message);
    } else {
      setError(null);
      setSelectedItems([]);
    }
  };

  // Handle rent now - adds to cart and redirects to cart page
  const handleRentNow = (item) => {
    if (!user) {
      alert('Please log in to rent equipment');
      return;
    }

    if (item.status !== 'Available') {
      alert('This equipment is currently not available for rent');
      return;
    }

    // Add to cart if not already added
    if (!isInCart(item.id)) {
      addToCart(item);
    }

    // Redirect to cart page
    window.location.href = '/customer/cart';
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Available':
        return { color: 'bg-green-100 text-green-800', icon: '✓' };
      case 'Rented':
        return { color: 'bg-red-100 text-red-800', icon: '⏰' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: '?' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Beautiful Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-gray-600 text-sm">Equipment you want to rent later</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Action Buttons */}
              <button 
                onClick={handleClearWishlist}
                disabled={loading || wishlistItems.length === 0}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
              <button 
                onClick={fetchWishlist}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              return (
                <div key={item.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${encodeURIComponent(item.name)}`;
                      }}
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.icon} {item.status}
                      </span>
                    </div>

                    {/* New Badge */}
                    {item.isNew && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          ✨ New
                        </span>
                      </div>
                    )}

                    {/* Remove Button */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        className="bg-white/90 backdrop-blur-sm text-red-500 p-2 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Category */}
                    <div className="mb-2">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">
                        {item.category}
                      </span>
                    </div>

                    {/* Equipment Name */}
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>

                    {/* Rating & Brand */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-sm">★</span>
                        <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.brand}</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-bold text-green-600">{item.price}</span>
                      <span className="text-gray-500 line-through text-sm">{item.originalPrice}</span>
                      <span className="text-xs text-gray-600">{item.period}</span>
                    </div>

                    {/* Location & Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{item.location}</span>
                      </div>
                      <span>Added {item.dateAdded}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRentNow(item)}
                        disabled={item.status !== 'Available'}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Rent Now
                      </button>
                      <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {!loading && viewMode === 'list' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Equipment</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Details</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Price</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wishlistItems.map((item) => {
                    const statusConfig = getStatusConfig(item.status);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        {/* Equipment */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.src = `https://via.placeholder.com/64x64/f3f4f6/6b7280?text=${encodeURIComponent(item.name.charAt(0))}`;
                                }}
                              />
                              {item.isNew && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">!</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.category}</p>
                            </div>
                          </div>
                        </td>

                        {/* Details */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500 text-sm">★</span>
                              <span className="text-sm text-gray-700">{item.rating}</span>
                              <span className="text-xs text-gray-500">• {item.brand}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-green-600">{item.price}</span>
                            <span className="text-gray-500 line-through text-sm">{item.originalPrice}</span>
                          </div>
                          <span className="text-xs text-gray-600">{item.period}</span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.icon} {item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleRentNow(item)}
                              disabled={item.status !== 'Available'}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Rent Now
                            </button>
                            <button 
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && wishlistItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start browsing equipment to add items to your wishlist</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Browse Equipment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

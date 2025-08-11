import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import apiService from '../../services/api';

// Beautiful Admin-Style Dashboard Design for Product Gallery
const adminDashboardStyles = `
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
      transform: scale(0.3) translateY(30px);
    }
    50% {
      opacity: 1;
      transform: scale(1.05) translateY(-10px);
    }
    70% {
      transform: scale(0.9) translateY(0);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes float3D {
    0%, 100% {
      transform: translateY(0px) rotateX(0deg);
    }
    50% {
      transform: translateY(-15px) rotateX(3deg);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3);
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

  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(139, 92, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.4);
    }
  }

  .animate-slide-in-up {
    animation: slideInUp 0.8s ease-out forwards;
  }

  .animate-bounce-in {
    animation: bounceIn 0.6s ease-out forwards;
  }

  .animate-float-3d {
    animation: float3D 4s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%);
    background-size: 200px 100%;
  }

  .animate-pulse-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }

  .simple-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .simple-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }

  .dashboard-stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .dashboard-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .glassmorphism {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .gradient-border {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
    padding: 2px;
    border-radius: 16px;
  }

  .gradient-border-inner {
    background: white;
    border-radius: 14px;
  }
`;

const ProductGallery = () => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [viewMode, setViewMode] = useState("Card");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("Popular");
  const [showFilters, setShowFilters] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.getProducts();
      
      if (response.success && response.data.products) {
        // Transform products to match the expected format
        const transformedProducts = response.data.products.map((product, index) => ({
          id: product._id,
          name: product.name,
          category: product.category,
          brand: product.brand || 'N/A',
          price: `₹${product.pricing.day}`,
          originalPrice: `₹${Math.round(product.pricing.day * 1.2)}`,
          period: "/day",
          status: product.stock > 0 ? "Available" : "Out of Stock",
          performance: `${Math.floor(Math.random() * 20) + 80}%`,
          performanceType: product.stock > 5 ? "Excellent" : "Good",
          image: product.images?.[0] || `https://images.unsplash.com/photo-${1581092918056 + index}?w=400&h=300&fit=crop&crop=center`,
          bgGradient: [`from-blue-600 to-purple-600`, `from-indigo-600 to-blue-600`, `from-purple-600 to-indigo-600`, `from-orange-600 to-red-600`][index % 4],
          highlight: index % 3 === 0 ? "Popular" : index % 3 === 1 ? "Premium" : "Eco-Friendly",
          rating: (4.0 + Math.random() * 1).toFixed(1),
          location: ["Mumbai, Maharashtra", "Delhi, NCR", "Pune, Maharashtra", "Bangalore, Karnataka"][index % 4],
          features: [
            "GPS Tracking",
            "Fuel Efficient", 
            "Expert Operator",
            "24/7 Support"
          ],
          description: product.description,
          stock: product.stock,
          currentAvailableStock: product.currentAvailableStock,
          isActive: product.isActive,
          originalData: product
        }));
        
        setProducts(transformedProducts);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setAnimateCards(true);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Listen for focus events to refresh products when returning from checkout
    const handleWindowFocus = () => {
      fetchProducts();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Handle product card click
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (product, event) => {
    event?.stopPropagation();
    
    if (!user) {
      alert('Please log in to add items to wishlist');
      return;
    }

    try {
      const result = await toggleWishlist(product);
      if (result.success) {
        // Show success message
        const isAdding = !isInWishlist(product.id);
        const message = isAdding ? 
          `${product.name} added to wishlist! ❤️` : 
          `${product.name} removed from wishlist`;
        
        // Create a simple toast notification
        showToast(message, isAdding ? 'success' : 'info');
      } else {
        showToast(result.message || 'Failed to update wishlist', 'error');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showToast('Failed to update wishlist', 'error');
    }
  };

  // Simple toast notification function
  const showToast = (message, type = 'info') => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    }`;
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  // Handle rent now - redirects to checkout page
  const handleRentNow = (product, event) => {
    event?.stopPropagation();
    
    if (!user) {
      alert('Please log in to rent equipment');
      return;
    }

    if (product.status !== 'Available') {
      alert('This equipment is currently not available for rent');
      return;
    }

    // Close modal if open
    if (showModal) {
      closeModal();
    }

    // Redirect to checkout page with product data
    navigate('/customer/checkout', { 
      state: { 
        product: product 
      } 
    });
  };

  // Dashboard Statistics (Admin style) - Now using dynamic data
  const getDashboardStats = () => {
    if (products.length === 0) return [];
    
    return [
      {
        title: "Total Equipment",
        value: products.length,
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
        color: "bg-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600",
        label: "Available"
      },
      {
        title: "Available Now",
        value: products.filter(p => p.status === "Available").length,
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        color: "bg-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-600",
        label: "Ready"
      },
      {
        title: "Currently Rented",
        value: products.filter(p => p.status === "Rented").length,
        icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
        color: "bg-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600",
        label: "Active"
      },
      {
        title: "Categories",
        value: [...new Set(products.map(p => p.category))].length,
        icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
        color: "bg-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600",
        label: "Types"
      }
    ];
  };

  const dashboardStats = getDashboardStats();

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case "Available":
        return {
          bgColor: "bg-green-50/90",
          textColor: "text-green-700",
          dotColor: "bg-green-500",
          label: "Available"
        };
      case "Rented":
        return {
          bgColor: "bg-orange-50/90",
          textColor: "text-orange-700",
          dotColor: "bg-orange-500",
          label: "In Use"
        };
      default:
        return {
          bgColor: "bg-slate-50/90",
          textColor: "text-slate-700",
          dotColor: "bg-slate-500",
          label: status
        };
    }
  };

  return (
    <>
      <style>{adminDashboardStyles}</style>
      <div className="min-h-screen bg-gray-50 space-y-6 p-6">
        {/* Header - Admin Dashboard Style */}
        <div className="text-center py-6 animate-slide-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Equipment Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Premium construction equipment rental with real-time availability
          </p>
          
          {/* Beautiful Search Bar */}
          <div className="max-w-xl mx-auto mt-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search equipment, brands, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-300 text-lg shadow-sm"
        />
      </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold">Error Loading Products</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={fetchProducts}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Stats - Admin Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-bounce-in">
          {dashboardStats.map((stat, index) => (
            <div key={index} className="dashboard-stat-card" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.color} rounded-xl`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <span className={`${stat.textColor} text-sm font-medium ${stat.bgColor} px-3 py-1 rounded-full`}>
                  {stat.label}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? (
                    <div className="w-16 h-8 bg-gray-200 rounded loading-skeleton"></div>
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-sm text-gray-400 mt-1">Equipment inventory</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls Section - Admin Style */}
        <div className="simple-card p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              >
                <option value="All">All Categories</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Lifting Equipment">Lifting Equipment</option>
                <option value="Construction">Construction</option>
                <option value="Earthmoving">Earthmoving</option>
                <option value="High-Rise Construction">High-Rise Construction</option>
              </select>
      </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("Card")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "Card"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Cards
              </button>
          <button
                onClick={() => setViewMode("List")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === "List"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
            </div>
          </div>
        </div>

        {/* Products Section - Admin Dashboard Style */}
        <div className="simple-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Equipment Gallery</h2>
            <div className="text-sm text-gray-500">
              {filteredProducts.length} equipment available
            </div>
          </div>

          {isLoading ? (
            /* Loading State */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="simple-card p-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg loading-skeleton mb-4"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded loading-skeleton mb-2"></div>
                  <div className="w-1/2 h-4 bg-gray-200 rounded loading-skeleton"></div>
                </div>
              ))}
            </div>
          ) : viewMode === "Card" ? (
            /* Card View - Admin Style */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => {
                const statusConfig = getStatusConfig(product.status);
                return (
                  <div
                    key={product.id}
                    className={`simple-card overflow-hidden cursor-pointer group ${
                      animateCards ? 'animate-slide-in-up' : 'opacity-0'
                    } ${product.stock <= 0 ? 'opacity-75 grayscale' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => product.stock > 0 && handleProductClick(product)}
                  >
                    {/* Image Section */}
                    <div className="relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${product.bgGradient} opacity-10`}></div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${encodeURIComponent(product.name)}`;
                        }}
                      />
                      
                                             {/* Status Badge */}
                       <div className="absolute top-3 left-3">
                         <div className={`flex items-center gap-2 ${
                           product.stock <= 0 
                             ? 'bg-red-500/90 text-white' 
                             : product.stock <= 5 
                               ? 'bg-orange-500/90 text-white'
                               : statusConfig.bgColor
                         } backdrop-blur-sm px-3 py-1 rounded-full`}>
                           <div className={`w-2 h-2 ${
                             product.stock <= 0 
                               ? 'bg-white' 
                               : product.stock <= 5 
                                 ? 'bg-white'
                                 : statusConfig.dotColor
                           } rounded-full`}></div>
                           <span className={`${
                             product.stock <= 0 || product.stock <= 5 
                               ? 'text-white' 
                               : statusConfig.textColor
                           } text-xs font-medium`}>
                             {product.stock <= 0 
                               ? 'Out of Stock' 
                               : product.stock <= 5 
                                 ? `Only ${product.stock} left`
                                 : statusConfig.label
                             }
                           </span>
                         </div>
                       </div>
 
                       {/* Highlight Badge */}
                       <div className="absolute top-3 right-3">
                         <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                           {product.highlight}
                         </span>
                       </div>
 
                       {/* Wishlist Heart Button */}
                       <div className="absolute top-12 left-3">
                         <button
                           onClick={(e) => handleWishlistToggle(product, e)}
                           className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg ${
                             isInWishlist(product.id)
                               ? 'bg-red-500 text-white hover:bg-red-600'
                               : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                           }`}
                         >
                           <svg className="w-4 h-4" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                           </svg>
                         </button>
                       </div>

                      {/* Performance Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                          {product.performance} Performance
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      {/* Category */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 text-sm">⭐</span>
                          <span className="text-sm text-gray-600 font-medium">{product.rating}</span>
                        </div>
                      </div>

                      {/* Equipment Name */}
                      <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight group-hover:text-blue-600 transition-colors duration-300">
                        {product.name}
                      </h3>

                      {/* Brand */}
                      <p className="text-sm text-gray-600 mb-3">{product.brand}</p>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-green-600">
                          {product.price}
              </span>
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                        <span className="text-sm text-gray-600 ml-auto bg-gray-100 px-2 py-1 rounded-full">{product.period}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{product.location}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {product.stock <= 0 ? (
                          <button
                            disabled
                            className="flex-1 bg-gray-400 text-white py-2 px-3 rounded-lg cursor-not-allowed text-sm font-medium"
                          >
                            Out of Stock
                          </button>
                        ) : (
                          <button
                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            onClick={(e) => handleRentNow(product, e)}
                          >
                            Rent Now
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.stock > 0) {
                              addToCart(product);
                            }
                          }}
                          disabled={product.stock <= 0}
                          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                            product.stock <= 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : isInCart(product.id)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isInCart(product.id) ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View - Admin Style */
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const statusConfig = getStatusConfig(product.status);
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img className="h-12 w-12 rounded-lg object-cover" src={product.image} alt={product.name} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.brand}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{product.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-semibold">{product.price}{product.period}</div>
                            <div className="text-sm text-gray-500 line-through">{product.originalPrice}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`flex items-center gap-2 ${statusConfig.bgColor} px-3 py-1 rounded-full w-fit`}>
                              <div className={`w-2 h-2 ${statusConfig.dotColor} rounded-full`}></div>
                              <span className={`${statusConfig.textColor} text-xs font-medium`}>
                                {statusConfig.label}
              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.performance}</div>
                            <div className="text-sm text-gray-500">{product.performanceType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleProductClick(product)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => addToCart(product)}
                                className={`px-3 py-1 rounded-lg transition-colors ${
                                  isInCart(product.id)
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isInCart(product.id) ? 'Added' : 'Add'}
                              </button>
                                                             <button
                                 onClick={(e) => handleWishlistToggle(product, e)}
                                 className={`p-2 rounded-lg transition-colors ${
                                   isInWishlist(product.id)
                                     ? 'bg-red-500 text-white hover:bg-red-600'
                                     : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                                 }`}
                               >
                                <svg className="w-4 h-4" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
        </div>

        {/* Product Detail Modal */}
        {showModal && selectedProduct && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <div className="flex items-center justify-center min-h-full py-4">
              <div 
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto transform transition-all duration-300 ${
                  showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className={`bg-gradient-to-r ${selectedProduct.bgGradient} p-6 rounded-t-2xl text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                      <div className="flex items-center gap-4 text-white/90">
                        <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                          {selectedProduct.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-300">⭐</span>
                          <span className="font-medium">{selectedProduct.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={closeModal}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full transition-all duration-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
          </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Image & Features */}
                    <div className="space-y-4">
                      <div className="relative">
                        <img 
                          src={selectedProduct.image} 
                          alt={selectedProduct.name}
                          className="w-full h-64 object-cover rounded-xl"
                          onError={(e) => {
                            e.target.src = `https://via.placeholder.com/500x300/f3f4f6/6b7280?text=${encodeURIComponent(selectedProduct.name)}`;
                          }}
                        />
                      </div>
                      
                      {/* Features */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedProduct.features?.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{feature}</span>
                            </div>
        ))}
      </div>
    </div>
                    </div>

                    {/* Details & Actions */}
                    <div className="space-y-4">
                      {/* Pricing */}
                      <div className="bg-green-50 rounded-xl p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Rental Price</h3>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-green-600">{selectedProduct.price}</span>
                          <span className="text-gray-500 line-through text-lg">{selectedProduct.originalPrice}</span>
                          <span className="text-sm text-gray-600 font-medium">{selectedProduct.period}</span>
                        </div>
                        <p className="text-sm text-gray-600">📍 {selectedProduct.location}</p>
                      </div>

                      {/* Equipment Details */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Equipment Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Brand:</span>
                            <span className="font-medium">{selectedProduct.brand}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">{selectedProduct.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Performance:</span>
                            <span className="font-medium">{selectedProduct.performance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className="font-medium">{selectedProduct.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button 
                          onClick={(e) => handleRentNow(selectedProduct, e)}
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Rent Now
                        </button>
                        <button 
                          onClick={() => addToCart(selectedProduct)}
                          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors ${
                            isInCart(selectedProduct.id)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {isInCart(selectedProduct.id) ? 'Added to Cart' : 'Add to Cart'}
                        </button>
                                                 <button
                           onClick={(e) => handleWishlistToggle(selectedProduct, e)}
                           className={`py-3 px-4 rounded-xl font-semibold transition-colors ${
                             isInWishlist(selectedProduct.id)
                               ? 'bg-red-500 text-white hover:bg-red-600'
                               : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                           }`}
                         >
                          <svg className="w-5 h-5" fill={isInWishlist(selectedProduct.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductGallery;
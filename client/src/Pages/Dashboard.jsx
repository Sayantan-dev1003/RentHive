import { useEffect, useState } from "react";
import apiService from "../services/api";

// Modern Animation Styles for Dashboard
const modernDashboardStyles = `
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
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.4);
    }
  }

  @keyframes statusPulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
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

const Dashboard = () => {
  const [animateStats, setAnimateStats] = useState(false);
  const [viewMode, setViewMode] = useState("Card");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  // Transformed products for display
  const rentalProducts = products.map((product, index) => ({
    id: product._id,
    name: product.name,
    brand: product.name,
    category: product.category,
    status: product.currentAvailableStock > 0 ? "Available" : product.currentAvailableStock === 0 ? "Rented" : "Maintenance",
    performance: `${Math.floor((product.currentAvailableStock / product.stock) * 100)}%`,
    performanceType: (product.currentAvailableStock / product.stock) > 0.7 ? "Good Performance" : "Bad Performance",
    image: apiService.getProductIcon(product.category),
    bgGradient: [
      "from-blue-600 to-purple-600",
      "from-indigo-600 to-blue-600", 
      "from-purple-600 to-indigo-600",
      "from-blue-700 to-purple-700",
      "from-green-600 to-blue-600",
      "from-indigo-600 to-purple-600",
      "from-orange-600 to-red-600",
      "from-purple-700 to-indigo-700"
    ][index % 8],
    highlight: product.currentAvailableStock === 0 ? "In Use" : "Available",
    originalData: product
  }));

  // Calculate real-time status data from orders
  const rentalStatusData = [
    { 
      label: "Reserved", 
      count: orders.filter(order => order.status === 'reserved').length, 
      color: "bg-green-500" 
    },
    { 
      label: "Quotation", 
      count: orders.filter(order => order.status === 'quotation').length, 
      color: "bg-orange-500" 
    },
  ];

  const invoiceStatusData = [
    { 
      label: "Fully Paid", 
      count: orders.filter(order => order.paymentStatus === 'paid').length, 
      color: "bg-blue-500" 
    },
    { 
      label: "Partial Payment", 
      count: orders.filter(order => order.paymentStatus === 'partial').length, 
      color: "bg-purple-500" 
    },
    { 
      label: "Pending Payment", 
      count: orders.filter(order => order.paymentStatus === 'pending').length, 
      color: "bg-gray-500" 
    },
  ];

  const pickupReturnData = [
    { 
      label: "Picked Up", 
      count: orders.filter(order => order.status === 'picked_up').length, 
      color: "bg-green-600" 
    },
    { 
      label: "Returned", 
      count: orders.filter(order => order.status === 'returned').length, 
      color: "bg-blue-600" 
    },
  ];

  // Fetch data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products and orders in parallel
      const [productsResponse, ordersResponse] = await Promise.all([
        apiService.getProducts(),
        apiService.getOrders()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.data.products || []);
      }

      if (ordersResponse.success) {
        setOrders(ordersResponse.data.orders || []);
      }

      // Calculate dashboard stats
      const totalProducts = productsResponse.data.products?.length || 0;
      const activeProducts = productsResponse.data.products?.filter(p => p.currentAvailableStock > 0).length || 0;
      const totalOrders = ordersResponse.data.orders?.length || 0;
      const totalRevenue = ordersResponse.data.orders?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;

      setDashboardStats({
        totalProducts,
        activeProducts,
        totalOrders,
        totalRevenue
      });

    } catch (err) {
      setError('Failed to fetch dashboard data: ' + err.message);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const timer = setTimeout(() => setAnimateStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500";
      case "Rented":
        return "bg-blue-500";
      case "Maintenance":
        return {
          bgColor: "bg-orange-50/90",
          textColor: "text-orange-700",
          dotColor: "bg-orange-500",
          label: "Maintenance"
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
      <style>{modernDashboardStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 space-y-8 animate-slide-in-up">
        {/* Error Message */}
        {error && (
          <div className="glassmorphism border border-red-200 text-red-700 px-6 py-4 rounded-2xl animate-bounce-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{error}</span>
              <button 
                onClick={fetchDashboardData}
                className="ml-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Modern Header */}
        <div className="text-center py-4">
          <div className="animate-slide-in-up">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Rental Dashboard
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Comprehensive equipment management system with real-time analytics
            </p>
          </div>
        </div>

        {/* Enhanced Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="gradient-border card-hover animate-bounce-in h-full" style={{ animationDelay: '0.1s' }}>
            <div className="gradient-border-inner p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg animate-glow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="text-blue-500 text-sm font-bold bg-blue-50 px-3 py-1 rounded-full animate-status-pulse">
                    Total
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 animate-bounce-in bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {loading ? (
                      <div className="w-16 h-8 bg-gray-200 rounded animate-shimmer"></div>
                    ) : (
                      dashboardStats.totalProducts
                    )}
                  </p>
                  <p className="text-xs text-gray-400">Equipment inventory</p>
                </div>
              </div>
            </div>
          </div>

                              <div className="gradient-border card-hover animate-bounce-in h-full" style={{ animationDelay: '0.2s' }}>
            <div className="gradient-border-inner p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg animate-glow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-emerald-500 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full animate-status-pulse">
                    Available
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Active Products</p>
                  <p className="text-3xl font-bold text-gray-900 animate-bounce-in bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {loading ? (
                      <div className="w-16 h-8 bg-gray-200 rounded animate-shimmer"></div>
                    ) : (
                      dashboardStats.activeProducts
                    )}
                  </p>
                  <p className="text-xs text-gray-400">Ready for rental</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-bounce-in h-full" style={{ animationDelay: '0.3s' }}>
            <div className="gradient-border-inner p-5 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg animate-glow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
                  </div>
                  <div className="text-yellow-600 text-sm font-bold bg-yellow-50 px-3 py-1 rounded-full animate-status-pulse">
                    Orders
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 animate-bounce-in bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {loading ? (
                      <div className="w-16 h-8 bg-gray-200 rounded animate-shimmer"></div>
                    ) : (
                      dashboardStats.totalOrders
                    )}
                  </p>
                  <p className="text-xs text-gray-400">All time orders</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gradient-border card-hover animate-bounce-in h-full" style={{ animationDelay: '0.4s' }}>
            <div className="gradient-border-inner p-5 h-full flex flex-col justify-between">
        <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg animate-glow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="text-purple-500 text-sm font-bold bg-purple-50 px-3 py-1 rounded-full animate-glow">
                    Revenue
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 animate-bounce-in bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {loading ? (
                      <div className="w-16 h-8 bg-gray-200 rounded animate-shimmer"></div>
                    ) : (
                      `₹${dashboardStats.totalRevenue.toLocaleString()}`
                    )}
                  </p>
                  <p className="text-xs text-gray-400">Total earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Search and Controls Section */}
        <div className="glassmorphism rounded-xl p-4 card-hover animate-slide-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Left Side - Search */}
            <div className="flex-1">
          <div className="relative">
            <input
              type="text"
                  placeholder="Search equipment by name, category, or brand..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur text-sm shadow-lg transition-all duration-300"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                    className="h-5 w-5 text-gray-400 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
                </div>
            </div>
          </div>

            {/* Right Side - View Toggle */}
            <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setViewMode("Card")}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2 text-sm ${viewMode === "Card"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                  }`}
              >
                <svg className="w-4 h-4 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Card View
            </button>
            <button
              onClick={() => setViewMode("List")}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2 text-sm ${viewMode === "List"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                  }`}
              >
                <svg className="w-4 h-4 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              List View
            </button>
          </div>
        </div>
      </div>

        {/* Modern Equipment Section */}
        <div className="glassmorphism rounded-xl p-4 card-hover animate-slide-in-up">
         

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-base text-gray-600 font-medium">Loading equipment data...</p>
                <p className="text-gray-400 text-xs mt-1">Please wait while we fetch the latest inventory</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">No Equipment Found</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">Your equipment inventory is empty. Add some equipment to get started with rental management.</p>
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg text-sm">
                Add First Equipment
              </button>
            </div>
                    ) : viewMode === "Card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentalProducts.map((product, index) => (
                <div key={product.id} className="gradient-border card-hover animate-bounce-in h-full" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="gradient-border-inner overflow-hidden h-full flex flex-col">
                    {/* Modern Image Section */}
                <div className="relative">
                  <img
                        src={`https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=250&fit=crop&crop=center`}
                    alt={product.name}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/400x250/3b82f6/ffffff?text=${encodeURIComponent(product.name)}`;
                        }}
                      />
                      
                                            {/* Status Badge - Top Right */}
                      <div className="absolute top-3 right-3">
                        <span className={`status-dot px-3 py-1 text-sm font-bold rounded-lg shadow-lg transition-all duration-300 animate-status-pulse ${
                          product.status === "Available" ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                          product.status === "Rented" ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                          'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        }`}>
                          {product.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Performance Badge - Top Left */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/30 backdrop-blur text-white text-sm font-medium px-3 py-1 rounded-lg">
                          {product.performance}
                  </span>
                </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                    </div>

                                                            {/* Modern Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      {/* Equipment Info */}
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-gray-700 font-medium text-sm">{product.brand}</span>
                            </div>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="text-gray-500 text-sm">{product.category}</span>
                          </div>
                    </div>
                        
                        {/* Performance Indicator */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500 font-medium">Performance:</span>
                            <span className="text-sm font-bold text-gray-700">{product.performance}</span>
                    </div>
                          <div className="bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                product.performanceType === "Good Performance" 
                                  ? "bg-gradient-to-r from-emerald-400 to-green-500" 
                                  : "bg-gradient-to-r from-orange-400 to-red-500"
                              }`}
                              style={{ width: product.performance }}
                            ></div>
                    </div>
                  </div>

                        {/* Modern Price Section */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                    <div>
                              <p className="text-sm text-gray-500 mb-1">Daily Rate</p>
                              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                                ₹{product.originalData?.pricing?.day || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-gray-600">Stock: <span className="font-bold">{product.originalData?.stock || 'N/A'}</span></span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-gray-600">Available: <span className="font-bold text-emerald-600">{product.originalData?.currentAvailableStock || 0}</span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                  
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
            <div className="glassmorphism rounded-2xl overflow-hidden animate-slide-in-up">
            {/* Pagination Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span>1-{rentalProducts.length}/{rentalProducts.length}</span>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Filter
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Monthly
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Vehicle ID</span>
              </div>
              <div>Brand & Model</div>
              <div>Category</div>
              <div>Assigned To</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {rentalProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className={`grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${animateStats
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                    }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  {/* Vehicle ID */}
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                        {product.image}
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </div>

                  {/* Brand & Model */}
                  <div className="flex items-center">
                    <span className="text-gray-700">{product.brand}</span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center">
                    <span className="text-gray-700">{product.category}</span>
                  </div>

                  {/* Assigned To */}
                  <div className="flex items-center">
                    {product.highlight ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {product.highlight.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-gray-700">{product.highlight}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${product.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : product.status === "Rented"
                          ? "bg-blue-100 text-blue-700"
                          : product.status === "Maintenance"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${product.status === "Available"
                          ? "bg-green-500"
                          : product.status === "Rented"
                            ? "bg-blue-500"
                            : product.status === "Maintenance"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                      ></div>
                      {product.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
    </>
  );
};

export default Dashboard;

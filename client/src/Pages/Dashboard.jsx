import { useEffect, useState } from "react";
import apiService from "../services/api";

// Enhanced modern styles with glassmorphism and animations
const optimizedDashboardStyles = `
  .glassmorphism {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }

  .card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .fade-in-up {
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .slide-in-right {
    opacity: 0;
    transform: translateX(30px);
    animation: slideInRight 0.6s ease-out forwards;
  }

  .pulse-scale {
    animation: pulseScale 2s ease-in-out infinite;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulseScale {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
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

const Dashboard = () => {
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
      <style>{optimizedDashboardStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 space-y-8 p-6">
        {/* Error Message */}
        {error && (
          <div className="glassmorphism border border-red-200/50 text-red-700 px-6 py-4 rounded-2xl animate-fade-in-up">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="font-medium">{error}</span>
              <button 
                onClick={fetchDashboardData}
                className="ml-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 text-sm font-medium shadow-lg"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        )}

      

        {/* Enhanced Dashboard Stats - Medium Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-blue-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 animate-pulse-scale">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                    📦 Total
                  </div>
                  <span className="text-xs text-gray-400 mt-1">inventory</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    dashboardStats.totalProducts
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">Equipment inventory</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 animate-pulse-scale">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                    ✅ Available
                  </div>
                  <span className="text-xs text-gray-400 mt-1">ready</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Active Products</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    dashboardStats.activeProducts
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">Ready for rental</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-yellow-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 animate-pulse-scale">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-yellow-600 text-xs font-bold bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                    📋 Orders
                  </div>
                  <span className="text-xs text-gray-400 mt-1">all time</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    dashboardStats.totalOrders
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">All time orders</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white rounded-2xl p-4 h-full shadow-lg border border-purple-100/50 hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 animate-pulse-scale">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-purple-600 text-xs font-bold bg-purple-50 px-2 py-1 rounded-full border border-purple-200">
                    💰 Revenue
                  </div>
                  <span className="text-xs text-gray-400 mt-1">earnings</span>
                </div>
              </div>
        <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    `₹${dashboardStats.totalRevenue.toLocaleString()}`
                  )}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-500 font-medium">Total earnings</p>
                </div>
              </div>
            </div>
          </div>
        </div>

                {/* Enhanced Search and Controls Section */}
        <div className="glassmorphism rounded-3xl p-6 card-hover animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Search */}
            <div className="flex-1">
          <div className="relative">
            <input
              type="text"
                  placeholder="🔍 Search equipment..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300 hover:bg-white/90"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
                </div>
            </div>
          </div>

            {/* Enhanced View Toggle */}
            <div className="flex bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
            <button
              onClick={() => setViewMode("Card")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  viewMode === "Card" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Card View
            </button>
            <button
              onClick={() => setViewMode("List")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  viewMode === "List" 
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/70"
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              List View
            </button>
          </div>
        </div>
      </div>

        {/* Enhanced Equipment Section */}
        <div className="glassmorphism rounded-3xl p-8 card-hover animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Products Inventory
              </h2>
              <p className="text-gray-600">Manage your rental equipment with real-time availability</p>
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Showing {rentalProducts.length} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Live inventory</span>
                </div>
              </div>
            </div>
          
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-purple-500 border-t-transparent" style={{ animationDelay: '0.1s' }}></div>
                </div>
                <p className="text-xl font-medium text-gray-700 mb-2">Loading Equipment Data...</p>
                <p className="text-gray-500">Fetching your rental inventory</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">No Equipment Found</h3>
              <p className="text-gray-600 mb-8 text-lg">Your equipment inventory is empty. Start by adding your first rental item.</p>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow-lg flex items-center gap-2 mx-auto">
                <span>🏗️</span> Add First Equipment
              </button>
            </div>
          ) : viewMode === "Card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rentalProducts.slice(0, 12).map((product, index) => (
                <div 
                  key={product.id}
                  className="relative group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 card-hover animate-fade-in-up border border-gray-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="h-full flex flex-col">
                    {/* Image Section */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
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
                      <div className="w-full h-full flex items-center justify-center text-4xl" style={{display: product.originalData?.images && product.originalData.images.length > 0 ? 'none' : 'flex'}}>
                        {product.image}
                      </div>
                      
                                            {/* Enhanced Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm ${
                          product.status === "Available" ? 'bg-green-500/90 text-white' :
                          product.status === "Rented" ? 'bg-blue-500/90 text-white' :
                          'bg-orange-500/90 text-white'
                        }`}>
                          {product.status === "Available" ? '✅ Available' : 
                           product.status === "Rented" ? '🔵 Rented' : '🔧 Maintenance'}
                        </span>
                      </div>

                      {/* Performance Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">
                          📊 {product.performance}
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Card Content */}
                    <div className="p-5 flex-1">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors duration-300">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded-lg">{product.brand}</span>
                          <span>•</span>
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">{product.category}</span>
                  </div>

                        {/* Enhanced Price Section */}
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-xl p-4 border border-gray-100">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Daily Rate</p>
                              <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ₹{product.originalData?.pricing?.day || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-gray-600 mb-1">
                                <span className="font-medium text-gray-700">Stock:</span> <span className="font-bold">{product.originalData?.stock || 'N/A'}</span>
                              </div>
                              <div className="text-green-600">
                                <span className="font-medium text-gray-700">Available:</span> <span className=" text-green-700  font-bold">{product.originalData?.currentAvailableStock || 0}</span>
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
            <div className="overflow-x-auto rounded-2xl border border-gray-200/50 shadow-lg">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">🏗️ Equipment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">🏢 Brand</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">📂 Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">📊 Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">📦 Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">💰 Price/Day</th>
                  </tr>
                </thead>
                <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-gray-100">
                  {rentalProducts.slice(0, 10).map((product, index) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-blue-50/50 transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center mr-4 overflow-hidden shadow-md">
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
                            <span className="text-lg" style={{display: product.originalData?.images && product.originalData.images.length > 0 ? 'none' : 'block'}}>
                              {product.image}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900">{product.name}</span>
                            <p className="text-xs text-gray-500">Equipment ID: #{product.id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">{product.brand}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                          product.status === "Available" ? "bg-green-100 text-green-700 border border-green-200" :
                          product.status === "Rented" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                          "bg-orange-100 text-orange-700 border border-orange-200"
                        }`}>
                          {product.status === "Available" ? '✅ Available' : 
                           product.status === "Rented" ? '🔵 Rented' : '🔧 Maintenance'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold">{product.originalData?.currentAvailableStock || 0}</span>
                          <span className="text-gray-400">/</span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-bold">{product.originalData?.stock || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ₹{product.originalData?.pricing?.day || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </div>

    </div>
    </>
  );
};

export default Dashboard;

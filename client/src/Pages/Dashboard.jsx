import { useEffect, useState } from "react";
import apiService from "../services/api";

// Optimized minimal styles for better performance
const optimizedStyles = `
  .simple-card {
    background: white;
    border-radius: 12px;
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
      <style>{optimizedStyles}</style>
      <div className="min-h-screen bg-gray-50 space-y-6 p-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">{error}</span>
              <button 
                onClick={fetchDashboardData}
                className="ml-auto px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Rental Dashboard
          </h1>
          <p className="text-gray-600">
            Equipment management system with real-time analytics
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="simple-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-blue-500 text-xs font-medium bg-blue-50 px-2 py-1 rounded">
                Total
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  dashboardStats.totalProducts
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Equipment inventory</p>
            </div>
          </div>

          <div className="simple-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-1 rounded">
                Available
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  dashboardStats.activeProducts
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Ready for rental</p>
            </div>
          </div>

          <div className="simple-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-yellow-600 text-xs font-medium bg-yellow-50 px-2 py-1 rounded">
                Orders
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-12 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  dashboardStats.totalOrders
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time orders</p>
            </div>
          </div>

          <div className="simple-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-purple-500 text-xs font-medium bg-purple-50 px-2 py-1 rounded">
                Revenue
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? (
                  <div className="w-16 h-6 bg-gray-200 rounded loading-skeleton"></div>
                ) : (
                  `₹${dashboardStats.totalRevenue.toLocaleString()}`
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total earnings</p>
            </div>
          </div>
        </div>

        {/* Search and Controls Section */}
        <div className="simple-card p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search equipment..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("Card")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "Card" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Card View
              </button>
              <button
                onClick={() => setViewMode("List")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  viewMode === "List" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
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

        {/* Equipment Section */}
        <div className="simple-card p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipment Inventory</h2>

          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-600">Loading equipment data...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Equipment Found</h3>
              <p className="text-gray-600 mb-4">Your equipment inventory is empty.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add Equipment
              </button>
            </div>
          ) : viewMode === "Card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {rentalProducts.slice(0, 12).map((product) => (
                <div key={product.id} className="simple-card overflow-hidden">
                  <div className="h-full flex flex-col">
                    {/* Image Section */}
                    <div className="relative">
                      <img
                        src={`https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=200&fit=crop&crop=center`}
                        alt={product.name}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/300x200/6b7280/ffffff?text=${encodeURIComponent(product.name)}`;
                        }}
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          product.status === "Available" ? 'bg-green-500 text-white' :
                          product.status === "Rented" ? 'bg-blue-500 text-white' :
                          'bg-orange-500 text-white'
                        }`}>
                          {product.status}
                        </span>
                      </div>

                      {/* Performance Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {product.performance}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-3 flex-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2 text-xs text-gray-600">
                          <span>{product.brand}</span>
                          <span>•</span>
                          <span>{product.category}</span>
                        </div>
                        
                        {/* Price */}
                        <div className="bg-gray-50 rounded-lg p-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-gray-500">Daily Rate</p>
                              <p className="text-lg font-bold text-gray-900">
                                ₹{product.originalData?.pricing?.day || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right text-xs">
                              <div className="text-gray-600">
                                Stock: <span className="font-medium">{product.originalData?.stock || 'N/A'}</span>
                              </div>
                              <div className="text-green-600">
                                Available: <span className="font-medium">{product.originalData?.currentAvailableStock || 0}</span>
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rentalProducts.slice(0, 10).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-3">
                            <span className="text-sm">🔧</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.brand}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "Available" ? "bg-green-100 text-green-800" :
                          product.status === "Rented" ? "bg-blue-100 text-blue-800" :
                          "bg-orange-100 text-orange-800"
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {product.originalData?.currentAvailableStock || 0}/{product.originalData?.stock || 0}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{product.originalData?.pricing?.day || 'N/A'}
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

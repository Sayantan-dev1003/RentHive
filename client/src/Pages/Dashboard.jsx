import { useEffect, useState } from "react";
import apiService from "../services/api";

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-500";
      case "Rented":
        return "bg-blue-500";
      case "Maintenance":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
          <button 
            onClick={fetchDashboardData}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex justify-center items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rental Orders</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search here..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("Card")}
              className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "Card"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Card View
            </button>
            <button
              onClick={() => setViewMode("List")}
              className={`px-4 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "List"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              List View
            </button>
          </div>

          {/* Create button */}
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover-lift shadow-lg hover:shadow-xl">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading dashboard data...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Add some products to get started</p>
          </div>
        ) : viewMode === "Card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rentalProducts.map((product, index) => (
              <div
                key={product.id}
                className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-transform transform hover:-translate-y-1 ${animateStats
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={`https://via.placeholder.com/400x250?text=${encodeURIComponent(
                      product.brand
                    )}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${product.status === "Available"
                      ? "bg-green-100 text-green-800"
                      : product.status === "Rented"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                      }`}
                  >
                    ● {product.status}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {product.brand}, {product.category}
                  </p>

                  {/* Stats Row */}
                  <div className="flex justify-between text-gray-600 text-sm mt-3">
                    <div className="flex items-center gap-1">
                      ⚙️ <span>{product.performance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      📊 <span>{product.performanceType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      🏷 <span>{product.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      🧑‍🔧 <span>{product.highlight || "N/A"}</span>
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Daily Rate</p>
                      <p className="text-lg font-bold text-green-600">₹{product.originalData?.pricing?.day || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col items-end text-xs text-gray-600">
                      <span>Stock: {product.originalData?.stock || 'N/A'}</span>
                      <span>Available: {product.originalData?.currentAvailableStock || 0}</span>
                      <span>Category: {product.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
            <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Vehicle ID</span>
              </div>
              <div>Brand & Model</div>
              <div>Category</div>
              <div>Assigned To</div>
              <div>Status</div>
              <div>Performance</div>
              <div>Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {rentalProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`grid grid-cols-7 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${animateStats
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

                  {/* Performance */}
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {product.performance}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${product.performanceType === "Good Performance"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {product.performanceType === "Good Performance"
                          ? "Good"
                          : "Poor"}
                      </span>
                    </div>
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
  );
};

export default Dashboard;

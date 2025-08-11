import { useEffect, useState } from "react";

// Clean and simple animation styles
const simpleAnimationStyles = `
  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .card-hover {
    transition: all 0.3s ease;
  }

  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const Dashboard = () => {
  const [animateStats, setAnimateStats] = useState(false);
  // const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState("Card");

  // Mock data for rental products
  const rentalProducts = [
    {
      id: 1,
      name: "TA 2173 XRQ",
      brand: "Tata Ace",
      category: "Medium",
      status: "Reserved",
      performance: 90,
      performanceType: "Good Performance",
      image: "/images/vehicles/tata-ace.jpg",
     
      highlight: "Chandan Bishoyi",
    },
    {
      id: 2,
      name: "MJ 3928 XRS",
      brand: "Mahindra Jeeto",
      category: "Medium",
      status: "PickedUp",
      performance: 50,
      performanceType: "Bad Performance",
      image: "/images/vehicles/mahindra-jeeto.jpg",
      
    },
    {
      id: 3,
      name: "BMC 5568 XRW",
      brand: "Bajaj Maxima",
      category: "Medium",
      status: "Quotation Sent",
      performance: 0,
      performanceType: "Bad Performance",
      image: "/images/vehicles/bajaj-maxima.jpg",
     
    },
    {
      id: 4,
      name: "MJ 3928 XRS",
      brand: "Mahindra Jeeto",
      category: "Medium",
      status: "Returned",
      performance: 50,
      performanceType: "Bad Performance",
      image: "/images/vehicles/mahindra-jeeto-2.jpg",
     
    },
    {
      id: 5,
      name: "TA 2173 XRQ",
      brand: "Tata Ace",
      category: "Medium",
      status: "Reserved",
      performance: 90,
      performanceType: "Good Performance",
      image: "/images/vehicles/tata-ace-2.jpg",
     
    },
    {
      id: 6,
      name: "MJ 3928 XRS",
      brand: "Mahindra Jeeto",
      category: "Medium",
      status: "PickedUp",
      performance: 50,
      performanceType: "Bad Performance",
      image: "/images/vehicles/mahindra-jeeto-3.jpg",
      
    },
    {
      id: 7,
      name: "BMC 5568 XRW",
      brand: "Bajaj Maxima",
      category: "Medium",
      status: "Maintenance",
      performance: 0,
      performanceType: "Bad Performance",
      image: "/images/vehicles/bajaj-maxima-2.jpg",
   
    },
    {
      id: 8,
      name: "MJ 3928 XRS",
      brand: "Mahindra Jeeto",
      category: "Medium",
      status: "Quotation Sent",
      performance: 50,
      performanceType: "Bad Performance",
      image: "/images/vehicles/tata-ace.jpg",
   
    },
  ];

  
  useEffect(() => {
    const timer = setTimeout(() => setAnimateStats(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Reserved":
        return {
          bgColor: "bg-emerald-50/90",
          textColor: "text-emerald-700",
          dotColor: "bg-emerald-500",
          label: "Reserved"
        };
      case "PickedUp":
        return {
          bgColor: "bg-rose-50/90",
          textColor: "text-rose-700",
          dotColor: "bg-rose-500",
          label: "PickedUp"
        };
      case "Quotation Sent":
        return {
          bgColor: "bg-violet-50/90",
          textColor: "text-violet-700",
          dotColor: "bg-violet-500",
          label: "Quotation Sent"
        };
      case "Returned":
        return {
          bgColor: "bg-red-50/90",
          textColor: "text-red-700",
          dotColor: "bg-red-500",
          label: "Returned"
        };
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
      {/* Inject clean animation styles */}
      <style>{simpleAnimationStyles}</style>
      
      <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="animate-in slide-in-from-left-5 duration-500">
          <h1 className="text-3xl font-bold text-gray-900">
            Rental Orders
          </h1>
        </div>

        <div className="flex items-center gap-4 animate-in slide-in-from-right-5 duration-500 delay-200">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search here..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80 bg-white transition-all duration-200 focus:scale-105"
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

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("Card")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 ${viewMode === "Card"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <svg className="w-4 h-4 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Card View
            </button>
            <button
              onClick={() => setViewMode("List")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105 ${viewMode === "List"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
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

      {/* Main Content */}
      <div className="w-full">
        {viewMode === "Card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentalProducts.map((product, index) => {
              const statusConfig = getStatusConfig(product.status);
              
              return (
                <div
                  key={product.id}
                  className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg overflow-hidden card-hover relative ${animateStats
                    ? "animate-fade-in-up"
                    : "opacity-0"
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-purple-50/20 pointer-events-none"></div>
                  
                  <div className="relative p-6">
                    {/* Status Badge */}
                    <div className="flex justify-end mb-6">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-md border backdrop-blur-sm ${statusConfig.bgColor} ${statusConfig.textColor} border-white/30`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor} animate-pulse`}></div>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Main Content Layout */}
                    <div className="flex items-center justify-between">
                      {/* Left Section - Vehicle Info */}
                      <div className="flex-1 pr-4">
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-gray-700 font-medium text-sm">{product.brand}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            <span className="text-gray-500 text-sm">{product.category}</span>
                          </div>
                        </div>

                        {/* Performance Section */}
                        <div className="bg-white/50 rounded-xl p-4 border border-gray-100 backdrop-blur-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-700 font-medium">Performance</span>
                            <span className={`font-bold text-lg ${
                              product.performance >= 70 
                                ? 'text-green-600' 
                                : product.performance >= 40 
                                ? 'text-yellow-600' 
                                : 'text-red-600'
                            }`}>{product.performance}%</span>
                          </div>
                          
                          {/* Performance Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 shadow-sm ${
                                product.performance >= 70 
                                  ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                  : product.performance >= 40 
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                                  : 'bg-gradient-to-r from-red-400 to-red-600'
                              }`}
                              style={{ 
                                width: animateStats ? `${product.performance}%` : '0%',
                                transitionDelay: `${index * 100 + 300}ms`
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Performance Type & Action */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full shadow-sm ${
                              product.performanceType === "Good Performance" 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                            }`}></div>
                            <span className="text-gray-700 text-sm font-medium">
                              {product.performanceType === "Good Performance" ? "Good Performance" : "Poor Performance"}
                            </span>
                          </div>
                          
                          {/* Action Button */}
                          <button className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-xl p-3 transition-all duration-300 shadow-sm hover:shadow-md group">
                            <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Right Section - Vehicle Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-28 h-24 bg-gradient-to-br from-white to-gray-100 rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                          {/* Image Border Glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <img
                            src={product.image || "/public/truck.png"}
                            alt={`${product.brand} ${product.name}`}
                            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 relative z-10"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          {/* Fallback emoji */}
                          <div className="absolute inset-0 text-3xl text-gray-400 hidden items-center justify-center bg-gray-50">
                            🚛
                          </div>
                          
                          {/* Image Overlay on Hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 z-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${product.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : product.status === "Idle"
                          ? "bg-gray-100 text-gray-700"
                          : product.status === "Maintenance"
                            ? "bg-red-100 text-red-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${product.status === "Active"
                          ? "bg-green-500"
                          : product.status === "Idle"
                            ? "bg-gray-500"
                            : product.status === "Maintenance"
                              ? "bg-red-500"
                              : "bg-purple-500"
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
    </>
  );
};

export default Dashboard;

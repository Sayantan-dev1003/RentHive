import React, { useState, useEffect } from "react";
import { useCart } from '../../context/CartContext';

const ProductGallery = () => {
  const { addToCart, isInCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("Category-1");
  const [selectedSort, setSelectedSort] = useState("Digital art");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState("New");
  const [selectedAvailability, setSelectedAvailability] = useState("In Stock");
  const [showFilters, setShowFilters] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Simulate loading and trigger animations
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAnimateCards(true);
    }, 500);
    return () => clearTimeout(timer);
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

  // Mock product data
  const products = [
    {
      id: 1,
      name: "Professional Excavator",
      price: "₹2,500",
      originalPrice: "₹3,000",
      highestBid: "₹2,800",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center",
      isNew: true,
      rating: 4.8,
      category: "Heavy Machinery",
      brand: "Caterpillar",
      model: "320D",
      description: "High-performance excavator perfect for construction projects. Features advanced hydraulic system and comfortable operator cabin.",
      specifications: {
        weight: "22,000 kg",
        maxDigDepth: "6.7 m",
        bucketCapacity: "1.2 m³",
        engine: "C6.6 ACERT"
      },
      availability: "Available",
      location: "Mumbai, Maharashtra",
      rentalPeriod: "Per Day",
      features: ["GPS Tracking", "Fuel Efficient", "24/7 Support", "Insurance Included"]
    },
    {
      id: 2,
      name: "Hydraulic Crane",
      price: "₹3,200",
      originalPrice: "₹3,800",
      highestBid: "₹3,500",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center",
      isNew: false,
      rating: 4.6,
      category: "Lifting Equipment",
      brand: "Liebherr",
      model: "LTM 1200",
      description: "Mobile hydraulic crane with exceptional lifting capacity. Perfect for heavy construction and infrastructure projects.",
      specifications: {
        maxLift: "200 tons",
        boomLength: "72 m",
        maxRadius: "58 m",
        engine: "Liebherr D946"
      },
      availability: "Available",
      location: "Delhi, NCR",
      rentalPeriod: "Per Day",
      features: ["Certified Operator", "All-Terrain", "Safety Equipment", "Emergency Support"]
    },
    {
      id: 3,
      name: "Bulldozer D8T",
      price: "₹4,800",
      originalPrice: "₹5,500",
      highestBid: "₹5,200",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&crop=center",
      isNew: true,
      rating: 4.9,
      category: "Earthmoving",
      brand: "Caterpillar",
      model: "D8T",
      description: "Heavy-duty bulldozer for large earthmoving projects.",
      specifications: {
        weight: "37,000 kg",
        bladeCapacity: "7.4 m³",
        engine: "C15 ACERT"
      },
      availability: "Available",
      location: "Pune, Maharashtra",
      rentalPeriod: "Per Day",
      features: ["GPS Tracking", "Automated Controls", "Fuel Monitoring"]
    },
    {
      id: 4,
      name: "Backhoe Loader",
      price: "₹1,800",
      originalPrice: "₹2,200",
      highestBid: "₹2,000",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop&crop=center",
      isNew: false,
      rating: 4.5,
      category: "Construction",
      brand: "JCB",
      model: "3DX",
      description: "Versatile backhoe loader for various construction tasks.",
      availability: "Available",
      location: "Bangalore, Karnataka",
      rentalPeriod: "Per Day",
      features: ["Multi-Purpose", "Easy Operation", "Fuel Efficient", "Maintenance Support"]
    },
    {
      id: 5,
      name: "Tower Crane",
      price: "₹6,500",
      originalPrice: "₹7,800",
      highestBid: "₹7,200",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop&crop=center",
      isNew: true,
      rating: 4.7,
      category: "High-Rise Construction",
      brand: "Potain",
      model: "MCT 85",
      description: "Self-erecting tower crane for high-rise construction.",
      availability: "Available",
      location: "Gurgaon, Haryana",
      rentalPeriod: "Per Month",
      features: ["High Reach", "Precision Control", "Safety Systems", "Remote Operation"]
    },
    {
      id: 6,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.45 ETH",
      image: "https://storage.googleapis.com/a1aa/image/921191b0-399b-4be3-6ad3-383e281aa89d.jpg",
      isNew: true,
      rating: 5.65
    },
    {
      id: 7,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.65 ETH",
      image: "https://storage.googleapis.com/a1aa/image/299327f4-669d-4caa-6f99-501673b1cc0f.jpg",
      isNew: true,
      rating: 5.65
    },
    {
      id: 8,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.65 ETH",
      image: "https://storage.googleapis.com/a1aa/image/03624c79-8261-4d40-7ee6-e4704e9c2800.jpg",
      isNew: true,
      rating: 5.65
    }
  ];

  const brands = ["TechMaster", "HomeSiple", "CopyLane", "JumpPro", "Brand3"];

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-700 mt-4 font-medium animate-pulse">Loading amazing products...</p>
          </div>
        </div>
      )}

<div className="w-full">
  {/* Minimalist Hero Section */}
  <div className="bg-white border-b border-gray-100 mb-6">
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
            Equipment Gallery
          </h1>
          <p className="text-sm text-gray-600">
            Find and rent construction equipment
          </p>
        </div>

        {/* Compact Search Bar (Left-aligned on small, right on larger screens) */}
        <div className="max-w-lg sm:ml-auto mt-3 sm:mt-0 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 text-gray-400"
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
            <input
              type="text"
              placeholder="Search equipment..."
              className="w-full pl-10 pr-16 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
            />
            <button className="absolute inset-y-0 right-0 pr-1 flex items-center">
              <div className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                Search
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>



        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Compact Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 mb-4 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>

            {/* Main Content */}
            <div className="flex-1">
              {/* Compact Stats & Controls */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{products.length}</div>
                      <div className="text-xs text-gray-500">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">Available</div>
                      <div className="text-xs text-gray-500">Ready</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Sort by Price</option>
                      <option>Sort by Rating</option>
                      <option>Sort by Date</option>
                    </select>
                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View All
                    </button>
                  </div>
                </div>
      </div>

              {/* Compact Category Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {["Heavy Machinery", "Lifting", "Construction", "Earthmoving"].map((category) => (
          <button
                          key={category}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selectedCategory === category
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{products.length} available</span>
                  </div>
                </div>
              </div>

            {/* Clean Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer ${
                    animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 30}ms`
                  }}
                  onClick={() => handleProductClick(product)}
                >
                                    {/* Clean Image Section */}
                  <div className="relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-36 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/300x200/f3f4f6/6b7280?text=${encodeURIComponent(product.name)}`;
                      }}
                    />
                    
                    {/* Simple Status Badge */}
                    {product.isNew && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">
                          New
                        </span>
                      </div>
                    )}

                    {/* Heart Icon */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="bg-white p-1.5 rounded-full hover:bg-gray-50 transition-colors">
                        <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Clean Content Section */}
                  <div className="p-3">
                    {/* Product Name */}
                    <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base leading-tight">
                      {product.name}
                    </h3>

                    {/* Category & Rating Row */}
                    <div className="flex items-center justify-between mb-2">
                      {product.category && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">
                          {product.category}
              </span>
            )}
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs text-gray-600">{product.rating}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg font-semibold text-green-600">
                        {product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">/day</span>
                    </div>

                    {/* Location */}
                    {product.location && (
                      <div className="flex items-center gap-1 mb-3 text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs">{product.location}</span>
                      </div>
                    )}

                    {/* Simple Button */}
                    <button 
                      className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Simple Pagination */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {products.length} products
                </div>
                
                <div className="flex items-center gap-1">
                  <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium">
                    1
                  </button>
                  <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors">
                    2
                  </button>
                  <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors">
                    3
                  </button>
                  <button className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden transform transition-all duration-300 ${
              showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Beautiful Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 p-6 rounded-t-2xl">
                <div className="absolute inset-0 bg-black/10 rounded-t-2xl"></div>
                <div className="relative flex items-start justify-between text-white">
                  <div className="flex-1 pr-4">
                    <h2 className="text-xl font-bold mb-2 leading-tight">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                        {selectedProduct.category}
                      </span>
                      <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-1 rounded-full">
                        <span className="text-yellow-300">★</span>
                        <span className="text-sm font-medium">{selectedProduct.rating}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Beautiful Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image & Features */}
                  <div className="space-y-4">
                    {/* Enhanced Image */}
                    <div className="relative group overflow-hidden rounded-xl">
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/500x300/f3f4f6/6b7280?text=${encodeURIComponent(selectedProduct.name)}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Key Features */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-blue-600">✨</span>
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedProduct.features?.slice(0, 6).map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex-shrink-0"></div>
                            <span className="leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                                    {/* Product Info & Actions */}
                  <div className="space-y-4">
                    {/* Pricing Card */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Rental Price</h3>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedProduct.availability}
              </span>
                      </div>
                      <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-3xl font-bold text-green-600">{selectedProduct.price}</span>
                        <span className="text-gray-500 line-through text-lg">{selectedProduct.originalPrice}</span>
                        <span className="text-sm text-gray-600 font-medium">/ {selectedProduct.rentalPeriod}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{selectedProduct.location}</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                          Rent Now
                        </button>
                        <button 
                          onClick={() => {
                            console.log('Button clicked, selectedProduct:', selectedProduct);
                            console.log('Is in cart:', isInCart(selectedProduct.id));
                            addToCart(selectedProduct);
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                            isInCart(selectedProduct.id)
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                          </svg>
                          {isInCart(selectedProduct.id) ? 'Added to Cart' : 'Add to Cart'}
          </button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 shadow-sm">
                      <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-gray-600">📋</span>
                        Equipment Details
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 text-sm">Brand:</span>
                          <span className="font-medium text-gray-900">{selectedProduct.brand}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 text-sm">Model:</span>
                          <span className="font-medium text-gray-900">{selectedProduct.model}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 text-sm">Category:</span>
                          <span className="font-medium text-gray-900">{selectedProduct.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specifications */}
                    {selectedProduct.specifications && (
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 shadow-sm">
                        <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-indigo-600">⚙️</span>
                          Specifications
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(selectedProduct.specifications).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center py-1">
                              <span className="text-gray-600 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-medium text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200 shadow-sm">
                      <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-purple-600">📝</span>
                        Description
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @media (max-width: 768px) {
          .grid-cols-1 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .sm\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1024px) and (max-width: 1280px) {
          .lg\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media (min-width: 1280px) {
          .xl\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default ProductGallery;
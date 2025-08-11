import React, { useState, useEffect } from "react";

const ProductGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("Category-1");
  const [selectedSort, setSelectedSort] = useState("Digital art");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState("New");
  const [selectedAvailability, setSelectedAvailability] = useState("In Stock");
  const [showFilters, setShowFilters] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and trigger animations
    const timer = setTimeout(() => {
      setIsLoading(false);
      setAnimateCards(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Mock product data
  const products = [
    {
      id: 1,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.45 ETH",
      image: "https://storage.googleapis.com/a1aa/image/59a87810-affe-47ed-1152-7a639b9499c9.jpg",
      isNew: true,
      rating: 5.65
    },
    {
      id: 2,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.65 ETH",
      image: "https://storage.googleapis.com/a1aa/image/921191b0-399b-4be3-6ad3-383e281aa89d.jpg",
      isNew: true,
      rating: 5.65
    },
    {
      id: 3,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.65 ETH",
      image: "https://storage.googleapis.com/a1aa/image/299327f4-669d-4caa-6f99-501673b1cc0f.jpg",
      isNew: true,
      rating: 5.65
    },
    {
      id: 4,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.65 ETH",
      image: "https://storage.googleapis.com/a1aa/image/03624c79-8261-4d40-7ee6-e4704e9c2800.jpg",
      isNew: true,
      rating: 5.65
    },
    {
      id: 5,
      name: "Digital art",
      price: "5.65 ETH",
      highestBid: "6.45 ETH",
      image: "https://storage.googleapis.com/a1aa/image/59a87810-affe-47ed-1152-7a639b9499c9.jpg",
      isNew: true,
      rating: 5.65
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
    <div className="min-h-screen">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 animate-pulse">Loading products...</p>
          </div>
        </div>
      )}

      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-4 transition-all duration-300 hover:bg-blue-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </button>

        

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 animate-fadeInUp">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Product Gallery</h1>
                <p className="text-gray-600">Explore and rent products.</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                Browse all
              </button>
            </div>

            {/* Category Tabs & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-700 transform hover:scale-105"
                  onClick={() => setSelectedCategory("Category-1")}
                >
                  Category-1
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 transition-all duration-300 hover:bg-gray-100 rounded-lg"
                  onClick={() => setSelectedCategory("Category-2")}
                >
                  Category-2
                </button>
                <button 
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 transition-all duration-300 hover:bg-gray-100 rounded-lg"
                  onClick={() => setSelectedCategory("Category-3")}
                >
                  Category-3
                </button>
              </div>
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:bg-blue-700 transform hover:scale-105">
                <span>Filter</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">CATEGORY</span>
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>Digital art</option>
                  <option>Physical art</option>
                  <option>Photography</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">PRICING</span>
                <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">ASCEN</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">ETH</span>
                <span className="text-sm font-medium">600ETH</span>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer ${
                    animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="relative group">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    {product.isNew && (
                      <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded animate-pulse">
                        New bid
                      </span>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white bg-opacity-90 text-gray-700 p-2 rounded-full hover:bg-opacity-100 transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm text-gray-600">{product.rating} ETH</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Highest bid: {product.highestBid}</p>
                    <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105">
                      Place Bid
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-center gap-2 animate-fadeInUp">
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105">
                Prev
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                1
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105">
                2
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105">
                3
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105">
                4
              </button>
              <button className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105">
                5
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

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
  );
};

export default ProductGallery;
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useState, useEffect } from "react";
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import apiService from '../../services/api';

const CustomerSidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const [customerStats, setCustomerStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    activeOrders: 0,
    recentActivity: []
  });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch customer stats
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [statsResponse, wishlistResponse] = await Promise.all([
        apiService.getCustomerStats(user?._id),
        apiService.getCustomerWishlist(user?._id)
      ]);
      
      if (statsResponse.success) {
        setCustomerStats(statsResponse.data);
      }
      
      if (wishlistResponse.success) {
        setWishlistCount(wishlistResponse.data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?._id) {
      fetchCustomerData();
    }
  }, [user]);

  return (
    <div
      className={`h-full ${
        sidebarCollapsed ? "w-16" : "w-80"
      } bg-white flex flex-col shadow-xl overflow-hidden transition-all duration-300 ease-in-out border-r border-gray-200`}
    >
      {/* Content Area */}
      <div className={`flex-1 ${sidebarCollapsed ? "p-2" : "p-6"} overflow-y-auto`}>
        {!sidebarCollapsed ? (
          <div className="space-y-6">
            {/* Toggle Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-2.5 bg-gray-100 rounded-xl text-gray-600 transition-all duration-300 hover:bg-gray-200 hover:text-gray-800 shadow-sm"
                title="Collapse sidebar"
              >
                <IoIosArrowForward />
              </button>
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👤</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Welcome back!</h3>
                  <p className="text-xs text-gray-600">{user?.name || 'Customer'}</p>
                </div>
              </div>
              <div className="text-xs text-gray-700">
                Total Spent: <span className="text-blue-600 font-bold">
                  {loading ? '...' : `₹${customerStats.totalSpent.toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Quick Stats
                </h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg text-center border border-green-200">
                  <div className="text-lg font-bold text-green-700">
                    {loading ? '...' : customerStats.activeOrders}
                  </div>
                  <div className="text-xs text-green-600">Active Orders</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg text-center border border-purple-200">
                  <div className="text-lg font-bold text-purple-700">{getCartCount()}</div>
                  <div className="text-xs text-purple-600">Cart Items</div>
                </div>
              </div>
            </div>

            {/* Wishlist & Favorites */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Wishlist & Favorites
                </h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">❤️</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-900 font-medium">Wishlist Items</div>
                    <div className="text-xs text-gray-600">
                      {loading ? 'Loading...' : `${wishlistCount} products saved`}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {loading ? '...' : wishlistCount}
                  </span>
                </div>
                <button className="w-full text-xs text-gray-700 hover:text-gray-900 transition-colors py-2 border border-rose-200 rounded-lg hover:bg-rose-100">
                  View All Favorites
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-xs text-gray-500 text-center py-2">Loading activity...</div>
                ) : customerStats.recentActivity.length > 0 ? (
                  customerStats.recentActivity.slice(0, 3).map((activity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'reserved' ? 'bg-green-500 animate-pulse' :
                        activity.status === 'quotation' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <span className="text-xs text-gray-700 flex-1">
                        {activity.description}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-500 text-center py-2">No recent activity</div>
                )}
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Our support team is here to assist you
                </p>
                <button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-4">
            {/* Collapsed indicators */}
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 transition-all duration-300 hover:bg-gray-200 hover:text-gray-800 cursor-pointer shadow-sm"
              title="Expand sidebar"
            >
              <IoIosArrowBack />
            </button>
            <div className="w-8 h-8 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-green-100 transition-colors" title="Orders">
              <span className="text-xs">📦</span>
            </div>
            <div className="w-8 h-8 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-rose-100 transition-colors" title="Wishlist">
              <span className="text-xs">❤️</span>
            </div>
            <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors" title="Activity">
              <span className="text-xs">📊</span>
            </div>
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-indigo-100 transition-colors" title="Support">
              <span className="text-xs">💬</span>
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
};

export default CustomerSidebar;
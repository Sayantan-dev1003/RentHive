import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useState } from "react";

const CustomerSidebar = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const [wishlistCount] = useState(12);
  const [cartItems] = useState(5);
  const [activeOrders] = useState(3);
  const [totalSpent] = useState(2450);

  return (
    <div
      className={`h-full ${
        sidebarCollapsed ? "w-16" : "w-80"
      } bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ease-in-out border-r border-slate-600/30`}
    >
      {/* Content Area */}
      <div className={`flex-1 ${sidebarCollapsed ? "p-2" : "p-6"} overflow-y-auto`}>
        {!sidebarCollapsed ? (
          <div className="space-y-6">
            {/* Toggle Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-2.5 bg-blue-500 rounded-xl text-white transition-all duration-300 hover:bg-blue-400 hover:scale-110 shadow-lg"
                title="Collapse sidebar"
              >
                <IoIosArrowForward />
              </button>
            </div>

            {/* Welcome Section */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👤</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Welcome back!</h3>
                  <p className="text-xs text-slate-300">Customer Portal</p>
                </div>
              </div>
              <div className="text-xs text-slate-300">
                Total Spent: <span className="text-white font-bold">₹{totalSpent.toLocaleString()}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Quick Stats
                </h3>
                <button className="text-slate-400 hover:text-white transition-colors">
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
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg text-center text-white">
                  <div className="text-lg font-bold">{activeOrders}</div>
                  <div className="text-xs opacity-90">Active Orders</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg text-center text-white">
                  <div className="text-lg font-bold">{cartItems}</div>
                  <div className="text-xs opacity-90">Cart Items</div>
                </div>
              </div>
            </div>

            {/* Wishlist & Favorites */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Wishlist & Favorites
                </h3>
                <button className="text-slate-400 hover:text-white transition-colors">
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
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">❤️</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-white font-medium">Wishlist Items</div>
                    <div className="text-xs text-slate-300">{wishlistCount} products saved</div>
                  </div>
                  <span className="text-sm font-bold text-white">{wishlistCount}</span>
                </div>
                <button className="w-full text-xs text-slate-300 hover:text-white transition-colors py-2 border border-slate-600/50 rounded-lg hover:bg-slate-700/30">
                  View All Favorites
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">
                  Recent Activity
                </h3>
                <button className="text-slate-400 hover:text-white transition-colors">
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
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-slate-300 flex-1">
                    Order #1234 delivered
                  </span>
                  <span className="text-xs text-slate-400">2h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-slate-300 flex-1">
                    Payment processed
                  </span>
                  <span className="text-xs text-slate-400">5h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-300 flex-1">
                    New product added to wishlist
                  </span>
                  <span className="text-xs text-slate-400">1d ago</span>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-lg">💬</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">Need Help?</h3>
                <p className="text-xs text-slate-300 mb-3">
                  Our support team is here to assist you
                </p>
                <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs py-2 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
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
              className="p-2.5 rounded-xl bg-blue-500 text-white transition-all duration-300 hover:bg-blue-400 hover:scale-110 cursor-pointer"
              title="Expand sidebar"
            >
              <IoIosArrowBack />
            </button>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-purple-500/30 rounded-xl flex items-center justify-center cursor-pointer" title="Orders">
              <span className="text-xs">📦</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-red-400/30 to-pink-500/30 rounded-xl flex items-center justify-center cursor-pointer" title="Wishlist">
              <span className="text-xs">❤️</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center cursor-pointer" title="Activity">
              <span className="text-xs">📊</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-xl flex items-center justify-center cursor-pointer" title="Support">
              <span className="text-xs">💬</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="p-6 border-t border-slate-600/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-2">
              Rent, Enjoy, Return
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">
                Online & Ready
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSidebar;